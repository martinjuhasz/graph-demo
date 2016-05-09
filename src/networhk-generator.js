'use strict'

let Chance = require('chance')
let _sample = require('lodash/sample')
let _random = require('lodash/random')
let _map = require('lodash/map')
let _find = require('lodash/find')

function createCommitment (contributionId, personId) {
  return {
    contribution: contributionId,
    person: personId
  }
}

module.exports = (numPeople, numContributions) => {
  numContributions = Math.max(5, numContributions)
  numPeople = Math.max(2, numPeople)
  let people = {}
  let peopleIds = []
  let contributions = {}
  let contributionIds = []
  let chance = new Chance()

  // Create people
  for (let i = 0; i < numPeople; i++) {
    let person = {
      id: i,
      name: chance.name(),
      commitments: []
    }
    person.email = person.name.replace(' ', '.') + '@example.com'
    people[i] = person
    peopleIds.push(i)
  }

  // Create contributions
  for (let i = 0; i < numContributions; i++) {
    let personId = _sample(peopleIds)
    contributions[i] = {
      id: i,
      title: chance.sentence({words: _random(1, 6)}),
      open: _sample([true, false]),
      priority: _sample(['gold', 'silver', 'bronze']),
      status: _sample(['good', 'good', 'good', 'good', 'good', 'bad']),
      creator: personId
    }
    contributionIds.push(i)
    // Creator commitment
    let commitment = createCommitment(i, personId)
    people[personId].commitments.push(commitment)
  }

  // Connect people to commitments
  _map(people, (person) => {
    for (let j = 0; j < _sample([1, 1, 1, 1, 1, 2, 5]); j++) {
      let contributionId
      while (!contributionId || _find(person.commitments, {'contribution': contributionId})) {
        contributionId = _sample(contributionIds)
      }
      let commitment = createCommitment(contributionId, person.id)
      person.commitments.push(commitment)
    }
  })

  return {
    people,
    peopleIds,
    contributions,
    contributionIds
  }
}
