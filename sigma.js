'use strict'

let _map = require('lodash/map')
let _sample = require('lodash/sample')
let avatarSize = 32
let springLength = 50
let networhkGenerator = require('./src/networhk-generator')

let numPeople = 25
let data = networhkGenerator(numPeople)

let Viva = require('vivagraphjs')
let graph = Viva.Graph.graph();
let graphics = Viva.Graph.View.svgGraphics();
_map(data.peopleIds, (personId) => {
  graph.addNode('person-' + personId, {type: 'person'})
})
_map(data.contributionIds, (contributionId) => {
  graph.addNode('contribution-' + contributionId, {type: 'contribution'})
})
_map(data.commitments, (commitment) => {
  graph.addLink('person-' + commitment.person, 'contribution-' + commitment.contribution, {status: commitment.status})
})

let defs = Viva.Graph.svg('defs');
graphics.getSvgRoot().append(defs);

graphics.node((node) => {
    if (node.data.type === 'contribution') {
      return Viva.Graph.svg('circle')
        .attr('r', avatarSize / 4)
        .attr('fill', _sample(['#F2B646', '#BABABA', '#E07D53']))
        .attr('data-type', node.data.type)
    } else {

      var pattern = Viva.Graph.svg('pattern')
        .attr('id', 'imageFor_' + node.id)
        .attr('patternUnits', 'userSpaceOnUse')
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
        .attr('data-type', node.data.type)
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
      nodeUI.attr('cx', pos.x).attr('cy', pos.y);
    } else {
      nodeUI.attr('transform', 'translate(' + (pos.x - (avatarSize / 2)) + ',' + (pos.y - (avatarSize / 2)) + ')');
    }
  })

graphics.link((link) => {
  return Viva.Graph.svg('line')
    .attr('stroke', link.data.status === 'good' ? '#99FF33' : '#dc0000')
    .attr('stroke-width', 1);
})

let layout = Viva.Graph.Layout.forceDirected(graph, {
  springLength,
  springCoeff: 0.0001,
  dragCoeff: 0.02,
  gravity: -2
});

var renderer = Viva.Graph.View.renderer(graph, {graphics, layout});
renderer.run();
