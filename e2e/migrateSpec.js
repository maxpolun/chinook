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
  describe('sql migrations', function(){
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
  pit('should only run migrations that have not been run already', function(){
    return Promise.using(testUtil.fixture(__dirname, 'multiple-sql-migrations'), function(dir){
      return testUtil.upMigration(dir, '001-create-users').then(function(){
        return testUtil.runCmd(dir, ['up'])  
      }).then(function(){
        return Promise.all([
          testUtil.expectTableToExist('users'), 
          testUtil.expectTableToExist('thingies')
        ])
      })
    })
  })
})
