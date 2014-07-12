'use strict'
var Promise = require('bluebird'),
    pg = require('pg')

function PostgresClient(rawClient, done) {
  this._client = rawClient
  this.done = done
}

PostgresClient.prototype.query = function query(queryStr, args) {
  var self = this
  return new Promise(function resolveQuery(resolve, reject){
    self._client.query(queryStr, args, function queryRan(err, results){
      if(err) {
        reject(err)
      }
      resolve(results)
    })
  })
}

function connect(dbUrl) {
  return new Promise(function connectToDb(resolve, reject){
    pg.connect(dbUrl, function connected(err, client, done){
      if(err) {
        reject(err)
      }
      resolve(new PostgresClient(client, done))
    })
  }).disposer(function disposeDB(client){
    client.done()
  })
}

connect.PostgresClient = PostgresClient

module.exports = connect
