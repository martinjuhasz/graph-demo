'use strict'

let yargs = require('yargs')
let Promise = require('bluebird')
let _forEach = require('lodash/forEach')

function run () {
  var argv = yargs
    .usage('Usage: $0 <command> [options]')
    .demand(1)
    .command('networhk-generate <people> <contributions>', 'generate a networhk')
    .help()
    .argv

  switch (argv._[0]) {
    case 'networhk-generate':
      return Promise
        .try(() => {
          let generator = require('./src/networhk-generator')(+argv.people, +argv.contributions)
          _forEach(generator.people, (person) => {
            console.log(person.email, person.name)
          })
        })
    default:
      throw new Error('Unknown command: ' + argv._[0])
  }
}

run()
  .then(function () {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
