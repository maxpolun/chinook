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
  })
})
