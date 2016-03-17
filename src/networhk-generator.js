'use strict'

let Chance = require('chance')
let _sample = require('lodash/sample')
let _random = require('lodash/random')

module.exports = (numPeople) => {
  let people = {}
  let peopleIds = []
  let contribution = {}
  let contributionIds = []
  let commitments = []
  let chance = new Chance()

  // Create people
  for (let i = 0; i < numPeople; i++) {
    people[i] = {
      id: i,
      name: chance.name()
    }
    peopleIds.push(i)
  }

  // Create contributions
  for (let i = 0; i < numPeople * 4; i++) {
    let personId = _sample(peopleIds)
    contribution[i] = {
      id: i,
      title: chance.sentence({words: _random(1, 6)}),
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
      commitments.push(createCommitment(i, contributorId))
    }
  }

  function createCommitment(commitmentId, personId) {
    return {
      contribution: commitmentId,
      person: personId,
      status: _sample(['good', 'bad'])
    }
  }

  console.log(peopleIds.length, 'People generated')
  console.log(contributionIds.length, 'Contributions generated')
  console.log(commitments.length, 'Commitments generated')

  return {
    people,
    peopleIds,
    contribution,
    contributionIds,
    commitments
  }
}
