/**
 * @type { MessageHandler }
 */
module.exports = async function stop ({ message, guild }) {
    if (!guilds[message.guild.id]) {
        message.reply('I haven\'t played anything yet :(')
        return
    }

    if (guild.isPlaying()) {
        guild.stop()
    } else {
        message.reply('Nothing to stop')
    }
}
