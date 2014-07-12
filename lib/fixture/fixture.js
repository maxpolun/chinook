'use strict'
var tmp = require('tmp'),
    Promise = require('bluebird')
var ncp = Promise.promisify(require('ncp').ncp),
    rimraf = Promise.promisify(require('rimraf'))

function fixture(path) {
  var fxPath
  return new Promise(function promiseForFixture(resolve, reject){
    tmp.dir(function tmpDirCreated(err, tmpPath){
      fxPath = tmpPath
      if(err) {
        return reject(err)
      }
      resolve(tmpPath)
    })
  }).then(function copyFixtureFiles(){
    return ncp(path, fxPath)
  }).then(function returnPath(){
    return fxPath
  }).disposer(function disposeFixture(){
    return rimraf(fxPath)
  })
}

module.exports = fixture
