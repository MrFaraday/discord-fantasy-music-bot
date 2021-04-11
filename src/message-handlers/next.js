/**
 * @type { MessageHandler }
 */
module.exports = async function next ({ message, guild }) {
    if (guild.isPlaying()) {
        return guild.skip()
    } else {
        return message.reply('Nothing to skip')
    }
}
