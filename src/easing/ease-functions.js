/**
 * @param { number } x
 */
module.exports.easeOutSine = (x) => Math.sin((x * Math.PI) / 2)

/**
 * @param { number } x
 */
module.exports.easeInQuart = (x) => x * x * x * x

/**
 * @param { number } x
 */
module.exports.easeInExpo = (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10))
