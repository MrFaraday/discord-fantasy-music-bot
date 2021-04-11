/**
 * @type { MessageHandler }
 */
module.exports = async function volume ({ message, guild }) {
    const [_mode, volume] = args
    if (!volume) {
        message.reply('Set volume, 5 - default')
        return
    }
    if (isNaN(Number(volume))) {
        message.reply('It\'s not a number, it must be rational number')
        return
    }

    guild.changeVolume(parseInt(volume, 10))
}
