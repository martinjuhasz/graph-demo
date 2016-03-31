/* sin lookup table */

// http://jacksondunstan.com/articles/1190
// http://james.padolsey.com/javascript/double-bitwise-not/
// let radians = 1.2
let numDigits = 2
let pow = Math.pow(10, numDigits)
let round = 1.0 / pow
let len = 1 + 6.2828 * pow >> 0
let sinLUTTable = Array(len)

let theta = 0
for (let i = 0; i < len; ++i) {
  sinLUTTable[i] = Math.sin(theta)
  theta += round
}

module.exports = function sinLUT (radians) {
  return sinLUTTable[(((6.2828 * (~~(radians < 0))) + (radians % 6.2828)) * pow) >> 0]
}
