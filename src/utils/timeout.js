/**
 * @param { number } time
 */
module.exports.sleep = (time) => new Promise((resolve) => setTimeout(resolve, time))
