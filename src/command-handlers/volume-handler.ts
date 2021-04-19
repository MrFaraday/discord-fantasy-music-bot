import { Client, Message } from 'discord.js'
import db from '../db'

const updateVolumeQuery = 'UPDATE guild SET volume = $1 WHERE id = $2'

export default async function volumeHandler (
    this: Client,
    { message, guild, args }: CommadHandlerParams
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

    await db.query(updateVolumeQuery, [volume, message.guild.id])
    guild.changeVolume(Number(volume))

    return await message.channel.send(`Volume set to **${volume}%**`)
}
