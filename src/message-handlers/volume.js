/**
 * @type { MessageHandler }
 */
module.exports = async function volume ({ message, guild, args }) {
    const [, volume] = args

    if (!volume) {
        return message.reply('Set volume, 5 - default')
    } else if (isNaN(Number(volume))) {
        return message.reply('It\'s not a number, it must be rational number')
    }

    return guild.changeVolume(Number(volume))
}
