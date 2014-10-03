'use strict'
var path = require('path'), 
    Promise = require('bluebird'),
    fs = require('fs'),
    _ = require('lodash')

var readdir = Promise.promisify(fs.readdir, fs)

function migrationObj(parentDir, dir) {
  dir = path.join(parentDir, dir)
  var migrationsRegex = /(\d+)-([\w-_]+)/,
      dirname = path.basename(dir),
      match = dirname.match(migrationsRegex)
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
  var migrationsDir = path.join(dir, 'migrations')
  return readdir(migrationsDir).map(migrationObj.bind(null, migrationsDir))

}

module.exports = findMigrations