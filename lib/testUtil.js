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

function runCmd(dir, args){
  var cmdPath = ['node', path.join(__dirname, '..', 'main.js')].concat(args || []).join(' ')
  return exec(cmdPath, {
    cwd: dir,
    env: {
      DATABASE_URL: dbUrl
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
  return Promise.resolve(true)
}
