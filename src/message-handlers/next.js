/**
 * @type { MessageHandler }
 */
module.exports = async function next ({ message, guild }) {
    if (!guilds[message.guild.id]) {
        message.reply('I haven\'t played anything yet :(')
        return
    }

    if (guild.isPlaying()) {
        guild.skip()
    } else {
        message.reply('Nothing to skip')
    }
}
