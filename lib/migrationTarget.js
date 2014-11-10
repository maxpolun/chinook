'use strict'

var MigrationPlan = require('migrationPlan'),
    SqlFileMigration = require('migration').SqlFileMigration

function MigrationTarget(targetVersion, files, currentVersion) {
  this._targetVersion = targetVersion
  this._files = files
  this._currentVersion = currentVersion
}

MigrationTarget.prototype.plan = function planMigration() {
  var plan = new MigrationPlan(this.tracker),
      currentVersion = this._currentVersion
  this._files.forEach(function addMigrations(file){
    if(file.version > currentVersion) {
      plan.add(new SqlFileMigration(file.up.path))
    }
  })
  return plan
}

MigrationTarget.LAST_MIGRATION = Infinity
MigrationTarget.ZERO_MIGRATION = -Infinity

module.exports = MigrationTarget