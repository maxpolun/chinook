'use strict'
var Promise = require('bluebird'),
    fs = require('fs')

function SqlMigration(sqlStatement){
  this._sql = sqlStatement
}

SqlMigration.prototype.migrate = function migrate(client){
  return client.query(this._sql)
}

function readFile(filepath) {
  return new Promise(function resolveFile(resolve, reject){
    fs.readFile(filepath, function readFileCB(err, filedata){
      if(err) {
        return reject(err)
      }
      resolve(filedata)
    })
  })
}

SqlMigration.fromFile = function fromFile(filepath) {
  return readFile(filepath).then(function makeMigration(filedata){
    return new SqlMigration(filedata)
  })
}

module.exports.SqlMigration = SqlMigration
