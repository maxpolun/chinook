'use strict'
var path = require('path'),
    connect = require('databaseConnection'),
    Promise = require('bluebird'),
    migrationFiles = require('migrationFiles'),
    MigrationPlan = require('migrationPlan'),
    SqlMigration = require('migration').SqlMigration,
    MigrationTracker = require('migrationTracker')

function config(cwd) {
  return {
    migrations: path.join(cwd, 'migrations'),
    connection: process.env.DATABASE_URL,
    table: 'migrations_complete'
  }
}

module.exports.config = config

function migrations(config) {
  return migrationFiles(config.migrations)
}

module.exports.migrations = migrations

function up(migrations, config) {
  return Promise.using(connect(config.connection), function usingDb(client){
    var tracker = new MigrationTracker(client, config)
    return tracker.create().then(function waitForMigrations(){
      return migrations
    }).bind({}).tap(function saveMigrations(migrations){
      this.migrations = migrations
    }).map(function loadSqlFiles(loadedMigration){
      return SqlMigration.fromFile(loadedMigration.up.path)
    }).then(function buildPlan(sqlMigrations){
      var plan = new MigrationPlan()
      sqlMigrations.forEach(function addMigration(m){
        plan.add(m)
      })
      return plan.execute(client)
    }).then(function markMigrationComplete(){
      return tracker.up(this.migrations[0].version)
    })
  })
}

module.exports.up = up
