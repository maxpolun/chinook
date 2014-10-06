'use strict'
var fixture = require('fixture'),
    Promise = require('bluebird'),
    execCB = require('child_process').exec,
    path = require('path'),
    databaseConnection = require('databaseConnection')

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
