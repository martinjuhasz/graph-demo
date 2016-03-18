'use strict'

module.exports = (x1, y1, x2, y2, pixelCount) => {
  if (x1 === x2 && y1 === y2) {
    return {x1, y1, x2, y2}
  }

  let dx = x2 - x1
  let dy = y2 - y1
  if (dx === 0) { // vertical line
    if (y2 < y1) {
      y2 -= pixelCount
    } else {
      y2 += pixelCount
    }
  } else if (dy === 0) { // horizontal line
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
