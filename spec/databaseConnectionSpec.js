'use strict'

var connect = require('databaseConnection'),
    testUtil = require('testUtil'),
    Promise = require('bluebird')

require('jasmine2-pit')

describe('databaseConnection', function(){
  var con
  beforeEach(function(){
    con = connect(testUtil.dbUrl)
  })
  pit('should automatically close', function(){
    var client
    return Promise.using(con, function(pgClient){
      client = pgClient
      spyOn(client, 'done')
    }).then(function(){
      expect(client.done).toHaveBeenCalled()
    })
  })
  pit('should call postgres', function(){
    return Promise.using(con, function(client){
      client.query('SELECT 1;')
    })
  })
})
