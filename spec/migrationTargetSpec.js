'use strict'
var MigrationTarget = require('migrationTarget'),
    MigrationPlan = require('migrationPlan'),
    testUtil = require('testUtil')

describe('MigrationTarget', function(){
  var target,
      filesMany = [{
          name: 'test1',
          version: '001',
          up: {
            path: 'migrations/001-test1/up.sql'
          }
        }, {
          name: 'test2',
          version: '002',
          up: {
            path: 'migrations/002-test2/up.sql'
          }
        }],
      filesNone = []
  it('can be created', function(){
    target = new MigrationTarget(Infinity, filesNone, MigrationTarget.ZERO_MIGRATION)
    expect(target).not.toBeUndefined()
  })
  describe('plan', function(){
    it('should create a migrationPlan', function(){
      target = new MigrationTarget(Infinity, filesNone, MigrationTarget.ZERO_MIGRATION)
      expect(target.plan()).toEqual(jasmine.any(MigrationPlan))
    })
    it('should return an empty plan if there are no files', function(){
      target = new MigrationTarget(Infinity, filesNone, MigrationTarget.ZERO_MIGRATION)
      var plan = target.plan()
      expect(plan.count()).toEqual(0)
    })
    describe('with no existing migrations', function(){
      it('should contain all migrations up to target', function(){

        target = new MigrationTarget(MigrationTarget.LAST_MIGRATION, filesMany, MigrationTarget.ZERO_MIGRATION)
        var plan = target.plan()
        expect(plan.count()).toEqual(2)
        expect(plan._migrations[0].version).toEqual('001')
        expect(plan._migrations[1].version).toEqual('002')
      })
    })
    describe('with existing migrations', function(){
      it('should contain only migrations after the current migration', function(){
        target = new MigrationTarget(MigrationTarget.LAST_MIGRATION, filesMany, '001')
        var plan = target.plan()
        expect(plan.count()).toEqual(1)
        expect(plan._migrations[0].version).toEqual('002')
      })
    })
  })
})