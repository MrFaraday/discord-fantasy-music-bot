import { Client, Message } from 'discord.js'
import db from '../db'
import { SlashCommandBuilder } from '@discordjs/builders'

const setPrefixQuery = 'UPDATE guild SET command_prefix = $1 WHERE id = $2'

async function handler (
    this: Client,
    { guild, args, message }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return

    const currentPrefix = guild.prefix
    const [, newPrefix] = args

    if (!newPrefix && currentPrefix) {
        return await message.channel.send(`Current prefix: **${currentPrefix}**`)
    } else if (!newPrefix && !currentPrefix) {
        return await message.channel.send('There is no prefix')
    } else if (newPrefix.length > 10) {
        return await message.channel.send('Too long, maximum 10 of characters')
    }

    if (newPrefix === 'none') {
        guild.prefix = ''
        await db.query(setPrefixQuery, ['', message.guild.id])
        return await message.channel.send('Prefix removed')
    } else {
        guild.prefix = newPrefix
        await db.query(setPrefixQuery, [newPrefix, message.guild.id])
        return await message.channel.send(`New prefix: **${newPrefix}**`)
    }
}

const slashConfig = new SlashCommandBuilder().setName('prefix')

export default {
    aliases: ['prefix'],
    sort: 12,
    helpInfo: '`prefix [value]` set prefix for commands, enter ***none*** to remove it',
    slashConfig,
    handler
}
