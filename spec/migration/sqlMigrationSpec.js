'use strict'

var SqlMigration = require('migration').SqlMigration,
    Promise = require('bluebird'),
    fs = require('fs')

require('jasmine2-pit')

describe('SqlMigration', function(){
  var client
  beforeEach(function(){
    client = jasmine.createSpyObj('client', ['query', 'done'])
  })
  it('should be created', function(){
    var migration = new SqlMigration('')
    expect(migration).not.toBeUndefined()
  })
  describe('migrate', function(){
    pit('should call client.query with the given sql', function(){
      var migration = new SqlMigration('SELECT 1;')
      client.query.and.returnValue(Promise.resolve(true))
      return migration.migrate(client).then(function(){
        expect(client.query).toHaveBeenCalledWith('SELECT 1;')
      })
    })
  })
  describe('fromFile', function(){
    var promise
    beforeEach(function(){
      spyOn(fs, 'readFile').and.callFake(function(filepath, cb){
        cb(null, 'SELECT 1;')
      })
      promise = SqlMigration.fromFile('migrations/001-first-migration/up.sql')
    })
    pit('should return a migration', function(){
      return promise.then(function(migration){
        expect(migration).toEqual(jasmine.any(SqlMigration))
      })
    })
    pit('should call fs', function(){
      return promise.then(function(){
        expect(fs.readFile).toHaveBeenCalledWith('migrations/001-first-migration/up.sql', jasmine.any(Function))
      })
    })
  })
})
