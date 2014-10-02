'use strict'
var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path')

function SqlMigration(id, sqlStatement){
  this._sql = sqlStatement
  this.id = id
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

function idFromPath(filepath) {
  var segments = path.normalize(filepath).split(path.sep)
  return segments[segments.length - 2]
}

SqlMigration.fromFile = function fromFile(filepath) {
  return readFile(filepath).then(function makeMigration(filedata){
    var id = idFromPath(filepath)
    return new SqlMigration(id, filedata)
  })
}

module.exports.SqlMigration = SqlMigration
