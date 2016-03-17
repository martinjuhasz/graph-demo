'use strict'

let Chance = require('chance')
let _sample = require('lodash/sample')
let _random = require('lodash/random')
let _map = require('lodash/map')
let _filter = require('lodash/filter')

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
  let commitments = []
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
    commitments.push(createCommitment(i, personId))
    // Add random commitments
    for (let j = 0; j < _random(10); j++) {
      let contributorId = personId
      while (contributorId === personId) {
        contributorId = _sample(peopleIds)
      }
      let commitment = createCommitment(i, contributorId)
      commitments.push(commitment)
      people[contributorId].commitments.push(commitment)
    }
  }

  // Connect people without commitment
  _map(_filter(people, (person) => {
    return person.commitments.length === 0
  }), (person) => {
    let contributionId = _sample(contributionIds)
    let commitment = createCommitment(contributionId, person.id)
    commitments.push(commitment)
    person.commitments.push(commitment)
  })

  console.log(peopleIds.length, 'People generated')
  console.log(contributionIds.length, 'Contributions generated')
  console.log(commitments.length, 'Commitments generated')

  return {
    people,
    peopleIds,
    contributions,
    contributionIds,
    commitments
  }
}
