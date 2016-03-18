/* sin lookup table */

// http://jacksondunstan.com/articles/1190
// http://james.padolsey.com/javascript/double-bitwise-not/
//let radians = 1.2
let numDigits = 2
let pow = Math.pow(10, numDigits)
let round = 1.0 / pow
let len = 1 + 6.2828 * pow >> 0
let cosLUTTable = Array(len)

let theta = 0
for (let i = 0; i < len; ++i) {
  cosLUTTable[i] = Math.cos(theta)
  theta += round
}

module.exports = function cosLUT(radians) {
  return cosLUTTable[(((6.2828 * (~~(radians < 0))) + (radians % 6.2828)) * pow) >> 0]
}
