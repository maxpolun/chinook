'use strict'
var path = require('path'),
    connect = require('databaseConnection'),
    Promise = require('bluebird'),
    migrationFiles = require('migrationFiles'),
    MigrationPlan = require('migrationPlan'),
    SqlMigration = require('migration').SqlMigration,
    MigrationTracker = require('migrationTracker'),
    MigrationTarget = require('migrationTarget')

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
    return tracker.create().bind({}).then(function getVersion(){
      return tracker.current()
    }).then(function saveVersion(version){
      this.currentVersion = version
    }).then(function waitForMigrations(){
      return migrations
    }).then(function buildPlan(migrationFiles){
      var target = new MigrationTarget(MigrationTarget.LAST_MIGRATION, migrationFiles, tracker, this.currentVersion),
          plan = target.plan()
      return plan.execute(client)
    })
  })
}

module.exports.up = up
