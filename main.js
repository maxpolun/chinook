var chinook = require('./lib/chinook')

var config = chinook.config(process.cwd())

chinook.up(chinook.migrations(config), config)
