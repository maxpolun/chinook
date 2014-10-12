'use strict'
var Promise = require('bluebird')

function MigrationTracker(config) {
  this.tableName = config.table
}

MigrationTracker.prototype.create = function createDb(db) {
  return db.query('CREATE TABLE IF NOT EXISTS ' + this.tableName + ' (migration_version varchar(60));')
}

MigrationTracker.prototype.up = function upVersion(version, db) {
  return db.query('INSERT INTO ' + this.tableName + ' (migration_version) VALUES ($1)', [version])
}

MigrationTracker.prototype.down = function downVersion(version, db) {
  return db.query('DELETE FROM ' + this.tableName + ' where migration_version = $1', [version])
}

module.exports = MigrationTracker