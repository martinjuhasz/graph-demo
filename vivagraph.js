'use strict'

let _map = require('lodash/map')
let avatarSize = 32
let networhkGenerator = require('./src/networhk-generator')
let status2color = require('./src/status2color')

let numPeople = parseInt(window.location.hash.substr(1)) || 250
let numContributions = Math.ceil(numPeople / 4)
let data = networhkGenerator(numPeople, numContributions)

let Viva = require('vivagraphjs')
let graph = Viva.Graph.graph()
let graphics = Viva.Graph.View.svgGraphics()
_map(data.peopleIds, (personId) => {
  graph.addNode('person-' + personId, {type: 'person'})
})
_map(data.contributionIds, (contributionId) => {
  let contribution = data.contributions[contributionId]
  graph.addNode('contribution-' + contributionId, {
    type: 'contribution',
    open: contribution.open,
    priority: contribution.priority
  })
})
_map(data.commitments, (commitment) => {
  graph.addLink('person-' + commitment.person, 'contribution-' + commitment.contribution, {status: commitment.status})
})

let defs = Viva.Graph.svg('defs')
graphics.getSvgRoot().append(defs)

graphics.node((node) => {
    if (node.data.type === 'contribution') {
      let contribution = Viva.Graph.svg('circle')
        .attr('r', avatarSize / 4)
        .attr('data-type', node.data.type)
      if (node.data.open) {
        contribution.attr('stroke', status2color[node.data.priority]).attr('stroke-width', '4px')
        contribution.attr('fill', 'transparent')
      } else {
        contribution.attr('fill', status2color[node.data.priority])
      }
      return contribution
    } else {
      var pattern = Viva.Graph.svg('pattern')
        .attr('id', 'imageFor_' + node.id)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', avatarSize)
        .attr('height', avatarSize)

      var imageBg = Viva.Graph.svg('circle')
        .attr('cx', avatarSize / 2)
        .attr('cy', avatarSize / 2)
        .attr('fill', '#fff')
        .attr('r', avatarSize / 2)

      var image = Viva.Graph.svg('image')
        .attr('x', '0')
        .attr('y', '0')
        .attr('height', avatarSize)
        .attr('width', avatarSize)
        .link(chance.avatar({protocol: 'https'}) + '?s=' + avatarSize + '&d=monsterid')
      pattern.append(imageBg)
      pattern.append(image)
      defs.append(pattern)

      // now create actual node and reference created fill pattern:
      var ui = Viva.Graph.svg('g')
        .attr('data-type', node.data.type)
      var circle = Viva.Graph.svg('circle')
        .attr('cx', avatarSize / 2)
        .attr('cy', avatarSize / 2)
        .attr('fill', 'url(#imageFor_' + node.id + ')')
        .attr('stroke', '#000')
        .attr('stroke-width', '1px')
        .attr('r', avatarSize / 2)

      ui.append(circle)
      return ui
    }
  })
  .placeNode(function (nodeUI, pos) {
    if (nodeUI.attr('data-type') === 'contribution') {
      nodeUI.attr('cx', pos.x).attr('cy', pos.y)
    } else {
      nodeUI.attr('transform', 'translate(' + (pos.x - (avatarSize / 2)) + ',' + (pos.y - (avatarSize / 2)) + ')')
    }
  })
  .placeLink(function (linkUI, fromPos, toPos) {
    let from = fromPos
    let to = toPos
    let shortenAtContribution = lengthenLine(from.x, from.y, to.x, to.y, -(avatarSize / 2))
    let shortenAtContributor = lengthenLine(shortenAtContribution.x2, shortenAtContribution.y2, shortenAtContribution.x1, shortenAtContribution.y1, -(avatarSize / 2) - 4)
    linkUI.attr('x1', shortenAtContributor.x1)
    linkUI.attr('y1', shortenAtContributor.y1)
    linkUI.attr('x2', shortenAtContributor.x2)
    linkUI.attr('y2', shortenAtContributor.y2)
  })

function lengthenLine(x1, y1, x2, y2, pixelCount) {
  if (x1 === x2 && y1 === y2) {
    return {x1, y1, x2, y2}
  }

  let dx = x2 - x1
  let dy = y2 - y1
  if (dx == 0) { // vertical line
    if (y2 < y1) {
      y2 -= pixelCount
    } else {
      y2 += pixelCount
    }
  } else if (dy == 0) { // horizontal line
    if (x2 < x1) {
      x2 -= pixelCount
    } else {
      x2 += pixelCount
    }
  } else { // non-horizontal, non-vertical line:
    let length = Math.sqrt(dx * dx + dy * dy)
    let scale = (length + pixelCount) / length
    dx *= scale
    dy *= scale
    x2 = x1 + dx
    y2 = y1 + dy
  }
  return {x1, y1, x2, y2}
}


graphics.link((link) => {
  return Viva.Graph.svg('line')
    .attr('stroke', status2color[link.data.status])
    .attr('stroke-width', 2)
})

let layout = Viva.Graph.Layout.forceDirected(graph, {
  springLength: 50,
  springCoeff: 0.0001,
  dragCoeff: 0.02,
  gravity: -2.5
})

var renderer = Viva.Graph.View.renderer(graph, {graphics, layout})
renderer.run()
