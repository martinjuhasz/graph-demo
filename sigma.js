'use strict'

let avatarSize = 32
let springLength = 50
let networhkGenerator = require('./src/networhk-generator')
let status2color = require('./src/status2color')
let Chance = require('chance')
let chance = new Chance()

let numPeople = parseInt(window.location.hash.substr(1)) || 250
let numContributions = Math.ceil(numPeople / 4)
let data = networhkGenerator(numPeople, numContributions)

let g = {
  nodes: [],
  edges: []
}
let s = new sigma({
  graph: g,
  container: document.getElementById('container'),
  type: 'canvas',
  settings: {
    zoomMin: 0.001,
    minNodeSize: 0.1,
    minEdgeSize: 0.5,
    maxEdgeSize: 1.0,
    sideMargin: 100,
    defaultLabelColor: '#fff',
    defaultEdgeColor: '#fff',
    defaultNodeColor: '#fff'
  }
})

let forceAtlasConfig = {
  worker: true,
  barnesHutOptimize: true,
  slowDown: 100,
  autoStop: true,
  scalingRatio: springLength,
  gravity: 2
}
s.startForceAtlas2(forceAtlasConfig)

// Custom rendering

let sinLUT = require('./src/sinLUT')
let cosLUT = require('./src/cosLUT')

sigma.utils.pkg('sigma.canvas.nodes')
// draw person node
sigma.canvas.nodes.person = (() => {
  var _cache = {},
    _loading = {},
    _callbacks = {}
  // Return the renderer itself:
  let renderer = function (node, context, settings) {
    let prefix = settings('prefix') || ''
    let size = avatarSize / 2
    let url = node.url
    if (_cache[url]) {
      context.save()
      // Draw the clipping disc:
      context.beginPath()
      context.arc(
        node[prefix + 'x'],
        node[prefix + 'y'],
        size,
        0,
        Math.PI * 2,
        true
      )
      context.closePath()
      context.clip()
      // Draw the image
      context.drawImage(
        _cache[url],
        node[prefix + 'x'] - size,
        node[prefix + 'y'] - size,
        2 * size,
        2 * size
      )
      // Quit the "clipping mode":
      context.restore()

      // Draw the border:
      context.beginPath()
      context.arc(
        node[prefix + 'x'],
        node[prefix + 'y'],
        size,
        0,
        Math.PI * 2,
        true
      )
      context.lineWidth = 1
      context.strokeStyle = 'rgb(0,0,0)'
      context.stroke()
    } else {
      sigma.canvas.nodes.person.cache(url)
      sigma.canvas.nodes.def.apply(
        sigma.canvas.nodes,
        arguments
      )
    }
  }
  renderer.cache = function (url, callback) {
    if (callback) {
      _callbacks[url] = callback
    }
    if (_loading[url]) {
      return
    }
    var img = new Image()
    img.onload = function () {
      _loading[url] = false
      _cache[url] = img
      if (_callbacks[url]) {
        _callbacks[url].call(this, img)
        delete _callbacks[url]
      }
    }
    _loading[url] = true
    img.src = url
  }
  return renderer
})()

// draw rhequest node
sigma.canvas.nodes.contribution = (() => {
  return (node, context, settings) => {
    let prefix = settings('prefix') || ''
    let size = avatarSize / 4
    let url = node.url

    // Draw the border:
    context.beginPath()
    context.arc(
      node[prefix + 'x'],
      node[prefix + 'y'],
      size,
      0,
      Math.PI * 2,
      true
    )

    if (node.open) {
      // Draw circle
      context.lineWidth = 3
      context.strokeStyle = node.color
      context.stroke()
    } else {
      context.fillStyle = node.color
      context.fill()
    }
  }
})()


// draw edge
sigma.utils.pkg('sigma.canvas.edges')
sigma.canvas.edges.def = (edge, source, target, context, settings) => {
  let color = edge.color
  let prefix = settings('prefix') || ''
  let lineWidth = edge[prefix + 'size'] || 1

  // angle between source and target
  var sourceX = source[prefix + 'x']
  var sourceY = source[prefix + 'y']
  var targetX = target[prefix + 'x']
  var targetY = target[prefix + 'y']

  // saved in node  and just look up value
  var thisSizeSource = (Math.sqrt(source[prefix + 'size'] / 3.1414)) * avatarSize * 0.25
  var thisSizeTarget = (Math.sqrt(target[prefix + 'size'] / 3.1414)) * avatarSize * 0.25

  var dx = targetX - sourceX
  var dy = targetY - sourceY
  var angle = Math.atan2(dy, dx)
  var newSX = sourceX + cosLUT(angle) * (thisSizeSource * 1.5)
  var newSY = sourceY + sinLUT(angle) * (thisSizeSource * 1.5)
  var newTX = targetX + cosLUT(3.1414 + angle) * (thisSizeTarget * 1.5)
  var newTY = targetY + sinLUT(3.1414 + angle) * (thisSizeTarget * 1.5)

  context.strokeStyle = color
  context.lineWidth = 2
  context.beginPath()
  context.moveTo(
    newSX,
    newSY
  )
  context.lineTo(
    newTX,
    newTY
  )
  context.stroke()
}

// Initiate the graph

let GraphPopulator = require('./src/graph-populator')
new GraphPopulator(data, {
  addPerson: (person) => {
    s.graph.addNode({
      id: 'person-' + person.id,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: avatarSize / 2,
      type: 'person',
      url: chance.avatar({protocol: 'https'}) + '?s=' + avatarSize + '&d=monsterid',
      fixed: 0
    })
  },
  addCommitment: (commitment) => {
    s.graph.addEdge({
      id: 'commitment-' + commitment.contribution + '-' + commitment.person,
      source: 'person-' + commitment.person,
      target: 'contribution-' + commitment.contribution,
      size: '4',
      color: status2color[commitment.status]
    })
  },
  addContribution: (contribution) => {
    s.graph.addNode({
      id: 'contribution-' + contribution.id,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: avatarSize / 4,
      type: 'contribution',
      color: status2color[contribution.priority],
      open: contribution.open,
      fixed: 0
    })
  },
  beginUpdate: () => {
    s.killForceAtlas2()
  },
  endUpdate: () => {
    s.startForceAtlas2(forceAtlasConfig)
  },
  interval: 250
}).populate()
