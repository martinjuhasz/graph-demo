'use strict'

let _map = require('lodash/map')
let _chunk = require('lodash/chunk')
let _defaults = require('lodash/defaults')

let noop = () => {
}

function GraphPopulator(data, options) {
  this.data = data
  this.callbacks = _defaults(options, {
    begin: noop,
    end: noop,
    beginUpdate: noop,
    endUpdate: noop,
    addPerson: noop,
    addCommitment: noop,
    addContribution: noop
  })
  this.interval = options.interval || 100
}

GraphPopulator.prototype.populate = function () {
  let self = this
  let renderedContribitions = {}
  let pages = _chunk(self.data.peopleIds, 10)
  self.callbacks.begin()
  var addInterval = setInterval(() => {
    let page = pages.shift()
    if (!page) {
      clearInterval(addInterval)
      self.callbacks.end()
      return
    }
    self.callbacks.beginUpdate()
    _map(page, (personId) => {
      let person = self.data.people[personId]
      self.callbacks.addPerson(person)
      _map(person.commitments, (commitment) => {
        if (!renderedContribitions[commitment.contribution]) {
          let contribution = self.data.contributions[commitment.contribution]
          self.callbacks.addContribution(contribution)
          renderedContribitions[commitment.contribution] = true
        }

        self.callbacks.addCommitment(commitment)
      })
    })
    self.callbacks.endUpdate()
  }, self.interval)
}

module.exports = GraphPopulator
