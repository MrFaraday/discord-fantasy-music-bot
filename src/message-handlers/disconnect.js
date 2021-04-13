/**
 * @type { MessageHandler }
 */
module.exports = function disconnect ({ guild }) {
    guild.disconnect()
}
