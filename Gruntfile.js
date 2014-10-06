'use strict'
module.exports = function(grunt) {
  var config = {}
  config.pkg = grunt.file.readJSON('package.json')
  config.nodefiles = ['main.js','lib/**/*.js','lib/*.js']
  config.nodespecfiles = ['spec/**/*Spec.js']
  config.browserfiles = []
  config.browserspecfiles = []
  config.e2efiles = ['e2e/**/*Spec.js', 'e2e/*Spec.js']
  config.backendFiles = config.nodespecfiles.concat(config.nodefiles)
  config.frontendFiles = config.browserfiles.concat(config.browserspecfiles)
  config.allCodeFiles = config.nodefiles.concat(config.browserfiles)
  config.allSpecFiles = config.nodespecfiles.concat(config.browserspecfiles).concat(config.e2efiles)
  config.allJS = config.backendFiles.concat(config.frontendFiles).concat(config.allSpecFiles)

  config.concurrent = {
    dev: {
      tasks: ['node-inspector', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    }
  }

  config['node-inspector'] = {
    dev: {}
  }

  config.spec = {
    default: {
      specs: config.allSpecFiles,
      isVerbose: true,
      showColors: true,
      includeStackTrace: true,
      defaultTimeoutInterval: 5000
    }
  }

  config.eslint = {
    code: {
      files: {
        src: config.allCodeFiles,
      },
      options: {
        config: 'config/eslint.json'
      }
    },
    specs: {
      files: {
        src: config.allSpecFiles,
      },
      options: {
        config: 'config/eslint-specs.json'
      }
    }
  }

  config.watch = {
    nodeSpecs: {
      files: config.allJS,
      tasks: 'spec'
    },
    lint: {
      files: config.allJS,
      tasks: 'eslint'
    }
  }

  grunt.initConfig(config)
  grunt.loadNpmTasks('eslint-grunt')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-node-inspector')
  grunt.loadNpmTasks('grunt-concurrent')

  grunt.registerMultiTask('spec', 'Run node jasmine specs', function(){
    var done = this.async();
    var jasmineLib = require('minijasminenode2');
    this.data.specs = grunt.file.expand(this.data.specs)
    this.data.onComplete = done
    jasmineLib.executeSpecs(this.data)
  })
  grunt.registerTask('default', ['concurrent:dev'])
}
