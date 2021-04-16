/**
 * @type { MessageHandler }
 */
module.exports = async function next ({ message, guild }) {
    if (guild.isPlaying()) {
        return guild.skip()
    } else {
        return await message.reply('Nothing to skip')
    }
}
