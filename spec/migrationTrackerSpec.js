'use strict'
var MigrationTracker = require('migrationTracker'),
    testUtil = require('testUtil'),
    databaseConnection = require('databaseConnection'),
    Promise = require('bluebird')

var testTable = 'migrations_test_table_1'

describe('MigrationTracker', function(){
  it('can be created', function(){
    var tracker = new MigrationTracker(jasmine.createSpy('db'), {table: 'migrations_complete'})
    expect(tracker).not.toBeUndefined()
  })
  describe('create', function(){
    beforeEach(function(done){
      Promise.using(databaseConnection(testUtil.dbUrl), function(db){
        return db.query('DROP TABLE IF EXISTS ' + testTable + ';')
      }).finally(done)
    })
      pit('will create a table if none exists', function(){
      return Promise.using(databaseConnection(testUtil.dbUrl), function(db){
        var tracker = new MigrationTracker(db, {table: testTable})
        return tracker.create().then(function(){
          return db.query('SELECT * FROM ' + testTable + ';')
        })
      })
    })
    pit('wont delete existing migrations', function(){
      return Promise.using(databaseConnection(testUtil.dbUrl), function(db){
        var tracker = new MigrationTracker(db, {table: testTable}), 
            previousMigrations
        return tracker.create().then(function(){
          return db.query('SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema = \'public\';')
        }).then(function(){
          return db.query('INSERT INTO ' + testTable + ' (migration_version)  VALUES ($1), ($2), ($3);', [1, 2, 3])
        }).then(function(){
          return db.query('SELECT * FROM ' + testTable + ';')
        }).then(function(results){
          previousMigrations = results.rows
        }).then(function(){
          return tracker.create()
        }).then(function(){
          return db.query('SELECT * FROM ' + testTable + ';')
        }).then(function(results){
          expect(JSON.stringify(results.rows)).toEqual(JSON.stringify(previousMigrations))
        })
      })
    })
  })
  describe('once the database has been created', function(){
    beforeEach(function(done){
      Promise.using(databaseConnection(testUtil.dbUrl), function(db){
        var tracker = new MigrationTracker(db, {table: testTable})
        return db.query('DROP TABLE IF EXISTS ' + testTable + ';').then(function(){
          return tracker.create()
        })
      }).finally(done)
    })

    describe('up', function(){
      pit('will update the database', function(){
        return Promise.using(databaseConnection(testUtil.dbUrl), function(db){
          var tracker = new MigrationTracker(db, {table: testTable})
          return tracker.up('12345').then(function(){
            return testUtil.migrationIsMarkedComplete('12345', testTable)
          })
        })
      })
    })
    describe('down', function(){
      pit('will update the database', function(){
        return Promise.using(databaseConnection(testUtil.dbUrl), function(db){
          var tracker = new MigrationTracker(db, {table: testTable})
          return tracker.up('12345').then(function(){
            return tracker.down('12345')
          }).then(function(){
            return testUtil.migrationIsMarkedComplete('12345', testTable)
          }).then(function(){
            throw 'migration should not be marked complete, but was'
          }).catch(testUtil.SqlError, function(){
            return 'SqlError is expected'
          })
        })
      })
    })
    describe('current', function(){
      pit('will fetch the current version of the database', function(){
        return Promise.using(databaseConnection(testUtil.dbUrl), function(db){
          var tracker = new MigrationTracker(db, {table: testTable})
          return tracker.up('12345').then(function(){
            return tracker.up('12346')
          }).then(function(){
            return tracker.current()
          }).then(function(version){
            expect(version).toEqual('12346')
          })
        })
      })
    })
  })
})

