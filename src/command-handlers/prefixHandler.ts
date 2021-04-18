import { Client, Message } from 'discord.js'
import db from '../db'

export default async function prefixHandler (
    this: Client,
    { guild, args, message }: CommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return

    const currentPrefix = guild.prefix
    const [, newPrefix] = args

    if (!newPrefix && currentPrefix) {
        return await message.reply(`Current prefix: **${currentPrefix}**`)
    } else if (!newPrefix && !currentPrefix) {
        return await message.reply('There is no prefix')
    } else if (newPrefix.length > 10 && newPrefix !== 'none') {
        return await message.reply('Too long, maximum 10 of characters')
    }

    const setPrefixQuery = 'UPDATE guild SET command_prefix = $1 WHERE id = $2'

    if (newPrefix === 'none') {
        guild.prefix = ''
        await db.query(setPrefixQuery, ['', message.guild.id])
        return await message.reply('Prefix removed')
    } else {
        guild.prefix = newPrefix
        await db.query(setPrefixQuery, [newPrefix, message.guild.id])
        return await message.reply(`New prefix: **${newPrefix}**`)
    }
}
