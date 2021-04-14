const db = require('../db')

/**
 * @type { MessageHandler }
 */
module.exports = async function volume ({ message, guild, args }) {
    const [, volumeParam] = args
    const volume = Number(volumeParam)

    const currentVolume = guild.volume

    if (!volumeParam) {
        return await message.reply(`Current volume: **${currentVolume}%**`)
    } else if (Number.isNaN(volumeParam)) {
        return await message.reply('Must be a number')
    } else if (!Number.isInteger(volume)) {
        return await message.reply('Must be integer')
    } else if (volume < 0 || volume > 100) {
        return await message.reply('Must be from 0 to 100')
    }

    await db.query('UPDATE guild SET volume = $1 WHERE id = $2', [volume, String(message.guild.id)])
    guild.changeVolume(Number(volume))

    return await message.reply(`Volume set to **${volume}%**`)
}
