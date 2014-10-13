'use strict'
var testUtil = require('testUtil'),
    Promise = require('bluebird')
require('jasmine2-pit')

describe('migrations up', function(){
  beforeEach(function(done){
    testUtil.cleanDb().finally(done)
  })

  pit('create a migrations_complete table', function(){
    return Promise.using(testUtil.fixture(__dirname, 'empty'), function(dir){
      return testUtil.runCmd(dir, ['up']).then(function(){
        return testUtil.expectTableToExist('migrations_complete')
      })
    })
  })
  describe('one sql migration', function(){
    pit('should run the migration sql', function(){
      return Promise.using(testUtil.fixture(__dirname, 'sql-migration'), function(dir){
        return testUtil.runCmd(dir, ['up']).then(function(){
          return testUtil.expectTableToExist('users')
        })
      })
    })
    pit('should update the migrations_complete table', function(){
      return Promise.using(testUtil.fixture(__dirname, 'sql-migration'), function(dir){
        return testUtil.runCmd(dir, ['up']).then(function(){
          return testUtil.migrationIsMarkedComplete('2014071512345')
        })
      })
    })
  })
  describe('multiple sql migrations', function(){
    pit('should run the sql', function(){
      return Promise.using(testUtil.fixture(__dirname, 'multiple-sql-migrations'), function(dir){
        return testUtil.runCmd(dir, ['up']).then(function(){
          return Promise.all([
            testUtil.expectTableToExist('users'), 
            testUtil.expectTableToExist('thingies')
          ])
        })
      })
    })
    pit('should update the migrations_complete table', function(){
      return Promise.using(testUtil.fixture(__dirname, 'multiple-sql-migrations'), function(dir){
        return testUtil.runCmd(dir, ['up']).then(function(){
          return Promise.all([
            testUtil.migrationIsMarkedComplete('001'),
            testUtil.migrationIsMarkedComplete('002')
          ])
        })
      })
    })
  })
})
