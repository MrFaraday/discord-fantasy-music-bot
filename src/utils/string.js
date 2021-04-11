/**
 * @param { string } str
 * @param { number } maxLength
 */
module.exports.shortString = (str, maxLength = 40) => {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3).padEnd(maxLength, '.')
    } else {
        return str
    }
}
