import { Client, Message } from 'discord.js'
import db from '../db'
import { isValidInteger } from '../utils/number'

async function handler (
    this: Client,
    { message, guild, args }: CommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return
    const [, bindParam] = args

    const bindKey = Number(bindParam)
    if (!bindParam) {
        return await message.channel.send('No params provided')
    } else if (!isValidInteger(bindKey, 0, 9)) {
        return await message.channel.send('Bind key must be an integer from 0 to 9')
    }

    try {
        await db.query('DELETE FROM slot WHERE guild_id = $1 AND slot_number = $2', [
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

export default {
    aliases: ['drop'],
    helpSort: 10,
    helpInfo: '`drop [0..9]` delete binded link',
    handler
}
