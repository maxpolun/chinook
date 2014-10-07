'use strict'
var path = require('path'),
    connect = require('databaseConnection'),
    Promise = require('bluebird'),
    migrationFiles = require('migrationFiles'),
    MigrationPlan = require('migrationPlan'),
    SqlMigration = require('migration').SqlMigration

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

function quit() {
  process.exit()
}

function up(migrations, config) {
  Promise.using(connect(config.connection), function usingDb(client){
    return client.query('CREATE TABLE IF NOT EXISTS ' + config.table + ' (migration_version varchar);').then(function waitForMigrations(){
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
    }).then(function markMigraationComplete(){
      return client.query('INSERT INTO ' + config.table + ' (migration_version) VALUES ($1);', [this.migrations[0].version])
    }).catch(migrationFiles.NoMigrationError, function noMigrationsFound(){
      console.log('No migrations found. Exiting.')
      quit()
    }).catch(function printError(err){
      console.error(err)
      process.exit(1)
    }).finally(quit)
  })
}

module.exports.up = up
