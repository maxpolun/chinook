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

function SqlFileMigration(filepath) {
  this.id = idFromPath(filepath)
  this.version = versionFromId(this.id)
  this._filepath = filepath

}

SqlFileMigration.prototype.migrate = function migrate(client) {
  return readFile(this._filepath).bind(this).then(function runMigration(filedata){
    return new SqlMigration(this.id, filedata.toString()).migrate(client)
  })
}

module.exports.SqlFileMigration = SqlFileMigration

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
  return new SqlFileMigration(filepath)
}

module.exports.SqlMigration = SqlMigration
