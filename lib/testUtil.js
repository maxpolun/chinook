'use strict'
var fixture = require('fixture'),
    Promise = require('bluebird'),
    execCB = require('child_process').exec,
    path = require('path'),
    databaseConnection = require('databaseConnection'),
    _ = require('lodash')

var fs = Promise.promisifyAll(require('fs'))

function exec(cmdline, options) {
  return new Promise(function resolveExec(resolve, reject){
    execCB(cmdline, options, function execCallback(error, stdout, stderr){
      var result = {error: error, stdout: stdout, stderr: stderr}
      if(error !== null) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

function createFixture(testDir, fixtureName) {
  return fixture(path.join(testDir, 'fixtures', fixtureName))
}

module.exports.fixture = createFixture

var dbUrl = 'postgres://chinook@localhost/chinook_test'
module.exports.dbUrl = dbUrl

function runCmd(dir, args){
  var cmdPath = ['node', path.join(__dirname, '..', 'main.js')].concat(args || []).join(' ')
  return exec(cmdPath, {
    cwd: dir,
    env: {
      DATABASE_URL: dbUrl
    }
  }).tap(function forwardStdout(result){
    if(result.stdout) {
      console.log(result.stdout)
    } else if(result.stderr) {
      console.log(result.stderr)
    }
  })
}

module.exports.runCmd = runCmd

function expectTableToExist(tableName) {
  return Promise.using(databaseConnection(dbUrl), function runQuery(client){
    return client.query('SELECT * FROM ' + tableName + ';')
  })
}

module.exports.expectTableToExist = expectTableToExist

function SqlError(msg) {
  this.name = 'SqlError'
  this.message = msg
}

SqlError.prototype = new Error()

module.exports.SqlError = SqlError

function migrationIsMarkedComplete(migrationVersion, migrationTable) {
  migrationTable = migrationTable || 'migrations_complete'
  return Promise.using(databaseConnection(dbUrl), function runQuery(client){
    return client.query('SELECT migration_version FROM ' + migrationTable + ';').then(function checkResults(results){
      return _.some(results.rows, {'migration_version': migrationVersion}) ?
        Promise.resolve(true) :
        Promise.reject(new SqlError('version not found: ' + migrationVersion + ' versions are: ' + JSON.stringify(results.rows)))
    })
  })
}

module.exports.migrationIsMarkedComplete = migrationIsMarkedComplete

module.exports.cleanDb = function fakeCleanDb(){
  return Promise.using(databaseConnection(dbUrl), function getTables(client){
    return client.query('SELECT table_schema,table_name FROM ' +
                        'information_schema.tables ' +
                        'ORDER BY table_schema,table_name;').then(function dropTables(results){
      var tables = results.rows.filter(function filterNonPublic(row){
            return row.table_schema === 'public'
          }).map(function getTableName(row){
            return row.table_name
          }),
          tableNames = tables.reduce(function combineTables(left, right){
            return left + ',' + right
          })

      return client.query('DROP TABLE ' + tableNames + ';')
    })
  })
}

function runSql(sql) {
  return Promise.using(databaseConnection(dbUrl), function usingConn(db) {
    return db.query(sql)
  })
}

module.exports.runSql = runSql

function upMigration(fixtureDir, migration) {
  var filePath = path.join(fixtureDir, 'migrations', migration, 'up.sql'),
      version = migration.match(/^(\d+)/)[1]
  return Promise.using(databaseConnection(dbUrl), function insertMigration(db){
    return fs.readFileAsync(filePath, {encoding: 'UTF-8'}).then(function runSql(sql){
      return db.query(sql)
    }).then(function insertVersion(){
      db.query('INSERT INTO migrations_complete (migration_version) VALUES ($1);', [version])
    })
  })
}

module.exports.upMigration = upMigration
