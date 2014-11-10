'use strict'
var Promise = require('bluebird')

function MigrationTracker(db, config) {
  this.tableName = config.table
  this.db = db
}

MigrationTracker.prototype.create = function createDb() {
  return this.db.query('CREATE TABLE IF NOT EXISTS ' + this.tableName + ' (migration_version varchar(60));')
}

MigrationTracker.prototype.up = function upVersion(version) {
  return this.db.query('INSERT INTO ' + this.tableName + ' (migration_version) VALUES ($1)', [version])
}

MigrationTracker.prototype.down = function downVersion(version) {
  return this.db.query('DELETE FROM ' + this.tableName + ' where migration_version = $1', [version])
}

MigrationTracker.prototype.current = function getCurrentVersion() {
  return this.db.query('SELECT migration_version FROM ' + this.tableName + ' ORDER BY migration_version DESC LIMIT 1').then(function simplifyResult(results){
    if(results.rows.length) {
      return results.rows[0].migration_version
    }
    return -Infinity
  })
}

module.exports = MigrationTracker