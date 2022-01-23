import { Client, Message } from 'discord.js'
import db from '../db'
import { isValidInteger } from '../utils/number'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { message, guild, args }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return
    const [, bindParam] = args

    const bindKey = Number(bindParam)
    if (!bindParam) {
        return await message.channel.send('No params provided')
    } else if (!isValidInteger(bindKey, 0, 15)) {
        return await message.channel.send('Bind key must be an integer from 0 to 15')
    }

    try {
        await db.query('DELETE FROM bind WHERE guild_id = $1 AND bind_key = $2', [
            message.guild.id,
            bindKey
        ])

        guild.binds.delete(bindKey)
        await message.channel.send('Deleted')
    } catch (error) {
        console.error(error)
        return await message.channel.send('Something went wrong, try later')
    }

    return Promise.resolve()
}

const slashConfig = new SlashCommandBuilder().setName('drop')

export default {
    aliases: ['drop'],
    sort: 10,
    helpInfo: '`drop [0..15]` delete binded link',
    slashConfig,
    handler
}
