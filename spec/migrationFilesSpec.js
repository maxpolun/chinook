'use strict'
var migrationFiles = require('migrationFiles'),
    Promise = require('bluebird'),
    fixture = require('testUtil').fixture,
    path = require('path')

describe('migrationFiles', function(){
  pit('should find files', function(){
    return Promise.using(fixture(__dirname, 'single-migration'), function(dir) {
      var filesPromise = migrationFiles(dir),
          upfile = path.join(dir, 'migrations', '1234567890-test', 'up.sql'),
          downfile = path.join(dir, 'migrations', '1234567890-test', 'down.js')
      return filesPromise.then(function(files){
        expect(files).toEqual([
          {
            name: 'test',
            version: '1234567890',
            up: {
              path: upfile,
              format: '.sql'
            },
            down: {
              path: downfile,
              format: '.js'
            }
          }
        ])
      })
    })
  })
})
