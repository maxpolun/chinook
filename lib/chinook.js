'use strict'
var path = require('path'),
    connect = require('databaseConnection'),
    Promise = require('bluebird')

function config(cwd) {
  return {
    migrations: path.join(cwd, 'migrations'),
    connection: process.env.DATABASE_URL,
    table: 'migrations_complete'
  }
}

module.exports.config = config

function migrations() {
  return []
}

module.exports.migrations = migrations

function up(migrations, config) {
  Promise.using(connect(config.connection), function usingDb(client){
    return client.query('CREATE TABLE IF NOT EXISTS ' + config.table + ' (id varchar);').then(function(result){
      console.log(result)
      process.exit(0)
    })
  })
}

module.exports.up = up
