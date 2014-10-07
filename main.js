#!/usr/bin/env node
'use strict'
var chinook = require('./lib/chinook'),
    migrationFiles = require('migrationFiles')

var config = chinook.config(process.cwd())

function quit() {
  process.exit()
}

chinook.up(chinook.migrations(config), config).catch(migrationFiles.NoMigrationError, function noMigrationsFound(){
    console.log('No migrations found. Exiting.')
    quit()
  }).catch(function printError(err){
    console.error(err)
    process.exit(1)
  }).finally(quit)
