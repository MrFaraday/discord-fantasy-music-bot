import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import db from '../db'
import queries from '../db/queries'
import MessageCommand from '../message-command'

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

    if (currentVolume !== volume) {
        await db.query(queries.updateVolume, [volume, message.guild.id])
        guild.changeVolume(Number(volume))
        await message.channel.send(`Volume set to **${volume}%**`)
    } else {
        await message.channel.send('It is current volume')
    }
}

const slashConfig = new SlashCommandBuilder().setName('volume')

export default new MessageCommand({
    aliases: ['v'],
    sort: 5,
    helpInfo: '`v [0..200?]` display or set volume',
    slashConfig,
    handler
})
