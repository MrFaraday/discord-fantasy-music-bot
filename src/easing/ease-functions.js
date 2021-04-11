module.exports.easeOutSine = (x) => Math.sin((x * Math.PI) / 2)
module.exports.easeInQuart = (x) => x * x * x * x
module.exports.easeInExpo = (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10))
