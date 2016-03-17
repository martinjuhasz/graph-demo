'use strict'

let Chance = require('chance')
let _sample = require('lodash/sample')
let _map = require('lodash/map')
let _random = require('lodash/random')
let chance = new Chance()
let people = {}
let peopleIds = []
let contribution = {}
let contributionIds = []
let commitments = []
let scale = 0.01
let numPeople = 2000 * scale
let avatarSize = 32

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
    person: personId
  }
}

console.log(peopleIds.length, 'People generated')
console.log(contributionIds.length, 'Contributions generated')
console.log(commitments.length, 'Commitments generated')

let Viva = require('vivagraphjs')
let graph = Viva.Graph.graph();
let graphics = Viva.Graph.View.svgGraphics();
_map(peopleIds, (personId) => {
  graph.addNode('person-' + personId, {type: 'person'})
})
_map(contributionIds, (contributionId) => {
  graph.addNode('contribution-' + contributionId, {type: 'contribution'})
})
_map(commitments, (commitment) => {
  graph.addLink('person-' + commitment.person, 'contribution-' + commitment.contribution)
})

let defs = Viva.Graph.svg('defs');
graphics.getSvgRoot().append(defs);

graphics.node(function (node) {
    if (node.data.type === 'contribution') {
      return Viva.Graph.svg('circle')
        .attr('r', 7)
        .attr('stroke', '#f00')
        .attr('stroke-width', '1.5px')
        .attr("fill", '#0f0')
        .attr("data-type", node.data.type)
    } else {

      var pattern = Viva.Graph.svg('pattern')
        .attr('id', "imageFor_" + node.id)
        .attr('patternUnits', "userSpaceOnUse")
        .attr('width', avatarSize)
        .attr('height', avatarSize)

      var image = Viva.Graph.svg('image')
        .attr('x', '0')
        .attr('y', '0')
        .attr('height', avatarSize)
        .attr('width', avatarSize)
        .link(chance.avatar({protocol: 'https'}) + '?s=' + avatarSize + '&d=monsterid');
      pattern.append(image);
      defs.append(pattern);

      // now create actual node and reference created fill pattern:
      var ui = Viva.Graph.svg('g')
        .attr("data-type", node.data.type)
      var circle = Viva.Graph.svg('circle')
        .attr('cx', avatarSize / 2)
        .attr('cy', avatarSize / 2)
        .attr('fill', 'url(#imageFor_' + node.id + ')')
        .attr('r', avatarSize / 2);

      ui.append(circle);
      return ui;
    }
  })
  .placeNode(function (nodeUI, pos) {
    if (nodeUI.attr('data-type') === 'contribution') {
      nodeUI.attr("cx", pos.x).attr("cy", pos.y);
    } else {
      nodeUI.attr('transform', 'translate(' + (pos.x - (avatarSize / 2)) + ',' + (pos.y - (avatarSize / 2)) + ')');
    }
  })

let layout = Viva.Graph.Layout.forceDirected(graph, {
  springLength: 50,
  springCoeff: 0.0001,
  dragCoeff: 0.02,
  gravity: -2
});

var renderer = Viva.Graph.View.renderer(graph, {graphics, layout});
renderer.run();
