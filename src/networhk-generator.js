'use strict'

let Chance = require('chance')
let _sample = require('lodash/sample')
let _random = require('lodash/random')
let _map = require('lodash/map')
let _filter = require('lodash/filter')
let _find = require('lodash/find')

function createCommitment(commitmentId, personId) {
  return {
    contribution: commitmentId,
    person: personId,
    status: _sample(['good', 'bad'])
  }
}

module.exports = (numPeople, numContributions) => {
  let people = {}
  let peopleIds = []
  let contributions = {}
  let contributionIds = []
  let chance = new Chance()

  // Create people
  for (let i = 0; i < numPeople; i++) {
    people[i] = {
      id: i,
      name: chance.name(),
      commitments: []
    }
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

  console.log(peopleIds.length, 'People generated')
  console.log(contributionIds.length, 'Contributions generated')

  return {
    people,
    peopleIds,
    contributions,
    contributionIds
  }
}
