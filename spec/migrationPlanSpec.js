'use strict'
var MigrationPlan = require('migrationPlan'),
    Promise = require('bluebird')

describe('migrationPlan', function(){
  var db, tracker, m1, m2, m3
  beforeEach(function(){
    db = jasmine.createSpyObj('db', ['query', 'done'])
    tracker = jasmine.createSpyObj('migrationTracker', ['up', 'down'])
    tracker.up.and.returnValue(Promise.resolve(null))
    m1 = jasmine.createSpyObj('m1', ['migrate'])
    m2 = jasmine.createSpyObj('m2', ['migrate'])
    m3 = jasmine.createSpyObj('m3', ['migrate'])
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
    it('can add migrations', function(){
      var plan = new MigrationPlan()
      plan.add(m1)
      plan.add(m2)
      plan.add(m3)
      expect(plan.count()).toEqual(3)
    })
  })
  describe('execute', function(){
    var plan
    beforeEach(function(){
      plan = new MigrationPlan(tracker)
      function fakeMigrate(num) { return function(db) {
        db.query('SELECT ' + num + ';')
        return Promise.resolve(null)
      }}
      m1.migrate.and.callFake(fakeMigrate(1))
      m2.migrate.and.callFake(fakeMigrate(2))
      m3.migrate.and.callFake(fakeMigrate(3))
      m1.version = '1'
      m2.version = '2'
      m3.version = '3'
      plan.add(m1)
      plan.add(m2)
      plan.add(m3)
    })
    pit('should execute migrations', function() {
      return plan.execute(db).then(function(){
        expect(db.query.calls.count()).toEqual(3)
        expect(db.query.calls.allArgs()).toEqual([['SELECT 1;'], ['SELECT 2;'], ['SELECT 3;']])  
      })
    })
    pit('should update the migrations_complete table ', function(){
      return plan.execute(db).then(function(){
        expect(tracker.up.calls.count()).toEqual(3)
        expect(tracker.up.calls.allArgs()).toEqual([['1'], ['2'], ['3']])
      })
    })
  })
})
