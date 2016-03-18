'use strict'

let _map = require('lodash/map')
let _chunk = require('lodash/chunk')

function GraphPopulator(data, callbacks) {
  this.data = data
  this.callbacks = callbacks
}

GraphPopulator.prototype.populate = function () {
  let self = this
  let renderedContribitions = {}
  let pages = _chunk(self.data.peopleIds, 10)
  var addInterval = setInterval(() => {
    let page = pages.shift()
    if (!page) {
      clearInterval(addInterval)
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
  }, 100)
}

module.exports = GraphPopulator
