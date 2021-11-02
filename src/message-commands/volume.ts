import { Client, Message } from 'discord.js'
import db from '../db'
import queries from '../db/queries'

async function handler (
    this: Client,
    { message, guild, args }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return

    const [, volumeParam] = args
    const volume = Number(volumeParam)

    const currentVolume = guild.volume

    if (!volumeParam) {
        return await message.channel.send(`Current volume: **${currentVolume}%**`)
    } else if (Number.isNaN(volumeParam)) {
        return await message.channel.send('Must be a number')
    } else if (!Number.isInteger(volume)) {
        return await message.channel.send('Must be integer')
    } else if (volume < 0 || volume > 200) {
        return await message.channel.send('Must be from 0 to 200')
    }

    await db.query(queries.updateVolume, [volume, message.guild.id])
    guild.changeVolume(Number(volume))

    return await message.channel.send(`Volume set to **${volume}%**`)
}

export default {
    aliases: ['v'],
    helpSort: 5,
    helpInfo: '`v [0..200?]` display or set volume',
    handler
}
