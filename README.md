Chinook
=======

A migration package based on node. Chinook is a type of salmon, a migratory fish.

## Philosophy

The philosophy of chinook is that you should be close to your db -- this is
manifest in several ways:

* You can have migrations written in pure sql, you don't need to use a DSL.
* chinook does not provide a DSL for migrations in node, feel free to bring your
  own though.

## Installation

```sh
npm install -g chinook
```

## running

```sh
chinook # just outputs a help message
chinook status # shows all migrations, and the state of the migrations
chinook init # sets up a migrations directory and a config file
chinook new name # create a new migration
chinook up [migrationid] # migrate up to migrationid, or the latest migration
chinook down [migrationid] # migrate down to migrationid, or the last migration
chinook reset # migrate down to before the earliest migration and remove
              # migration tracking table
```

## DB support

Only supports postgres right now.

## config file format

chinook.json is the config file for chinook. It should be in the directory where
chinook will be invoked.

Some important keys:

* ```migrations```: the relative path of the migrations directory, "migrations"
  by default
* ```table```: the name of the table where migrations are stored. "migrations_complete"
  by default
* ```connection```: has a key for each environment (passed in via the NODE_ENV
  environmental variable, with "development" as the default if not specified) with
  one connection configuration per environment
  * Each connection configuration should be a string. If it starts with a $,
    it's interpreted as an environmental variable, that should contain a connection
    url, if it does not start with a $, it's interpreted as a connection url
  * Note that if nothing is specified for the current environment, chinook looks
    at the ```DATABASE_URL``` environment variable

## migration format

Each migration is a directory with 2 files, up and down. They should be named
up.js/down.js for migrations that use javascript, and up.sql/down.sql for migrations
that are defined using sql.

The name of each migration directory should be [some number]-text-and-possibly-more-dashes.
The number is used to order the migrations so they can be numbered like 001, 002, etc
or they can be numbered with the current unix time (which is what the ```chinook new``` command)
