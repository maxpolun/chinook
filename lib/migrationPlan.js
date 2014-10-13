'use strict'
var Promise = require('bluebird')

// MigrationPlan is a set of migrations to be run
// It's dumb, it just runs migrations and updates the migration status table
function MigrationPlan(migrationTracker) {
  this._migrations = []
  this._tracker = migrationTracker
}

MigrationPlan.prototype.count = function migrationCount() {
  return this._migrations.length
}

MigrationPlan.prototype.add = function addMigration(migration) {
  return this._migrations.push(migration)
}

MigrationPlan.prototype.execute = function execute(db) {
  var promise = Promise.resolve(null),
      tracker = this._tracker
  this._migrations.forEach(function attachPromise(migration){
    promise = promise.then(function runMigration(){
      return migration.migrate(db)
    }).then(function updateTracker(){
      return tracker.up(migration.version)
    })
  })
  return promise
}

module.exports = MigrationPlan
