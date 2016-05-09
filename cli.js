'use strict'

const program = require('commander')
const Promise = require('bluebird')
const _map = require('lodash/map')
const _filter = require('lodash/filter')
const _forIn = require('lodash/forIn')

program
  .command('networhk-generate <people> <contributions>')
  .description('generate a netwoRHk')
  .action(
    (people, contributions) => {
      return Promise
        .try(() => {
          let netwoRHk = require('./src/networhk-generator')(+people, +contributions)
          let data = {
            users: [],
            contributions: []
          }
          let contributionCommitments = {}
          _forIn(netwoRHk.people, (user) => {
            let [firstname, lastname] = user.name.split(' ')
            data.users.push({
              email: user.email.toLowerCase(),
              firstname,
              lastname
            })
            _map(user.commitments, (commitment) => {
              if (!contributionCommitments[commitment.contribution]) {
                contributionCommitments[commitment.contribution] = []
              }
              contributionCommitments[commitment.contribution].push(user.email.toLowerCase())
            })
          })
          _forIn(netwoRHk.contributions, (contribution) => {
            let ownerEmail = netwoRHk.people[contribution.creator].email.toLowerCase()
            let c = {
              title: contribution.title,
              description: contribution.title,
              open: contribution.open,
              priority: contribution.priority,
              commitments: [
                {
                  user: ownerEmail,
                  status: contribution.status,
                  owner: true
                }
              ]
            }
            let userCommitments = _filter(contributionCommitments[contribution.id], (email) => {
              return email !== ownerEmail
            })
            _map(userCommitments, (email) => {
              c.commitments.push({
                user: email,
                status: Math.random() > 0.33 ? 'good' : 'bad'
              })
            })
            data.contributions.push(c)
          })
          console.log(JSON.stringify(data, null, '  '))
        })
        .then(() => {
          process.exit(0)
        })
        .catch((err) => {
          console.error(err)
          process.exit(1)
        })
    }
  )

program.parse(process.argv)
