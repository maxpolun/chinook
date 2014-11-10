'use strict'

var SqlMigration = require('migration').SqlMigration,
    SqlFileMigration = require('migration').SqlFileMigration,
    Promise = require('bluebird'),
    fs = require('fs')

require('jasmine2-pit')

describe('SqlMigration', function(){
  var db
  beforeEach(function(){
    db = jasmine.createSpyObj('db', ['query', 'done'])
  })
  it('should be created', function(){
    var migration = new SqlMigration('001-testMigration', '')
    expect(migration).not.toBeUndefined()
  })
  describe('migrate', function(){
    pit('should call db.query with the given sql', function(){
      var migration = new SqlMigration('001-testMigration', 'SELECT 1;')
      db.query.and.returnValue(Promise.resolve(true))
      return migration.migrate(db).then(function(){
        expect(db.query).toHaveBeenCalledWith('SELECT 1;')
      })
    })
  })
})
describe('SqlFileMigration', function(){
  it('should have the right id', function(){
    var migration = new SqlFileMigration('migrations/001-first-migration/up.sql')
    expect(migration.id).toEqual('001-first-migration')
  })
  it('should have the right version', function(){
    var migration = new SqlFileMigration('migrations/001-first-migration/up.sql')
    expect(migration.version).toEqual('001')
  })
  describe('migrate', function(){
    var db
    beforeEach(function(){
      db = jasmine.createSpyObj('db', ['query', 'done'])
      spyOn(fs, 'readFile').and.callFake(function(filepath, cb){
        cb(null, 'SELECT 1;')
      })
    })
    pit('should load the migration file and run the sql', function(){
      var migration = new SqlFileMigration('migrations/001-first-migration/up.sql')
      db.query.and.returnValue(Promise.resolve(true))
      return migration.migrate(db).then(function(){
        expect(db.query).toHaveBeenCalledWith('SELECT 1;')
      })
    })
  })
  describe('fromFile', function(){
    var migration
    beforeEach(function(){
      migration = SqlMigration.fromFile('migrations/001-first-migration/up.sql')
    })
    it('should return a file migration', function(){
      expect(migration).toEqual(jasmine.any(SqlFileMigration))
    })
    it('should have the right ID', function(){
      expect(migration.id).toEqual('001-first-migration')
    })
  })
})
