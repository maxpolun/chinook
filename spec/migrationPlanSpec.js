'use strict'
var MigrationPlan = require('migrationPlan'),
    Promise = require('bluebird')

describe('migrationPlan', function(){
  var db
  beforeEach(function(){
    db = jasmine.createSpyObj('db', ['query', 'done'])
  })
  describe('empty', function(){
    it('can be created', function(){
      var plan = new MigrationPlan()
      expect(plan).not.toBeUndefined()
    })
    pit('does nothing when executed', function(){
      return new MigrationPlan().execute(db).then(function(){
        expect(db.query).not.toHaveBeenCalled()
      })
    })
  })
  describe('add', function(){
    var m1, m2, m3
    beforeEach(function(){
      m1 = jasmine.createSpyObj('m1', ['migrate', 'id'])
      m2 = jasmine.createSpyObj('m2', ['migrate', 'id'])
      m3 = jasmine.createSpyObj('m3', ['migrate', 'id'])
    })
    it('can add a migration', function(){
      var plan = new MigrationPlan()
      expect(plan.count()).toEqual(0)
      plan.add(m1)
      expect(plan.count()).toEqual(1)
    })
    it('can add multiple migrations', function(){
      var plan = new MigrationPlan()
      plan.add(m1)
      plan.add(m2)
      plan.add(m3)
      expect(plan.count()).toEqual(3)
    })
    pit('should execute a single migration', function(){
      var plan = new MigrationPlan()
      m1.migrate.and.callFake(function(db){
        db.query('SELECT 1;')
        return Promise.resolve(null)
      })
      plan.add(m1)
      return plan.execute(db).then(function(){
        expect(db.query).toHaveBeenCalledWith('SELECT 1;')  
      })
      
    })
    pit('should execute multiple migrations', function() {
      var plan = new MigrationPlan()
      function fakeMigrate(num) { return function(db) {
        db.query('SELECT ' + num + ';')
        return Promise.resolve(null)
      }}
      m1.migrate.and.callFake(fakeMigrate(1))
      m2.migrate.and.callFake(fakeMigrate(2))
      m3.migrate.and.callFake(fakeMigrate(3))
      plan.add(m1)
      plan.add(m2)
      plan.add(m3)
      return plan.execute(db).then(function(){
        expect(db.query.calls.count()).toEqual(3)
        expect(db.query.calls.allArgs()).toEqual([['SELECT 1;'], ['SELECT 2;'], ['SELECT 3;']])  
      })
    })
  })
})
