'use strict'
var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path')

function idFromPath(filepath) {
  var segments = path.normalize(filepath).split(path.sep)
  return segments[segments.length - 2]
}

function versionFromId(id) {
  var migrationsRegex = /(\d+)-([\w-_]+)/,
      match = migrationsRegex.exec(id)

  return match[1]
}

function SqlMigration(id, sqlStatement){
  this._sql = sqlStatement
  this.id = id
  this.version = versionFromId(id)
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
    var id = idFromPath(filepath)
    return new SqlMigration(id, filedata.toString())
  })
}

module.exports.SqlMigration = SqlMigration
