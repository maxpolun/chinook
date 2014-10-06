'use strict'
var path = require('path'), 
    Promise = require('bluebird'),
    fs = require('fs'),
    _ = require('lodash')

var readdir = Promise.promisify(fs.readdir, fs)

function NoMigrationError() {}
NoMigrationError.prototype = new Error('No migrations found')

function migrationObj(dir) {
  var migrationsRegex = /(\d+)-([\w-_]+)/,
      dirname = path.basename(dir),
      match = dirname.match(migrationsRegex)
  if(!fs.statSync(dir).isDirectory()) {
    return Promise.reject(new NoMigrationError())
  }
  return readdir(dir).then(function expandObj(files){
    var upfile = _.find(files, function findUp(file){
          return file.match(/up.(js|sql)$/) 
        }),
        downfile = _.find(files, function findUp(file){
          return file.match(/down.(js|sql)$/)
        }),
        upFormat = path.extname(upfile),
        downFormat = path.extname(downfile)
    return {
      name: match[2],
      version: match[1],
      up: {
        path: path.join(dir, upfile),
        format: upFormat
      }, 
      down: {
        path: path.join(dir, downfile),
        format: downFormat
      }
    }
  })
}

function findMigrations(dir) {
  return readdir(dir).map(function fullPaths(file){
    return path.join(dir, file)
  }).map(migrationObj)
}

findMigrations.NoMigrationError = NoMigrationError

module.exports = findMigrations