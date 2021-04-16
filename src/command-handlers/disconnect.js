/**
 * @type { MessageHandler }
 */
module.exports = async function disconnect ({ guild }) {
    guild.disconnect()
}
