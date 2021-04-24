import { Client, Message } from 'discord.js'
import db from '../db'
import { isValidInteger } from '../utils/number'

export default async function dropHandler (
    this: Client,
    { message, guild, args }: CommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return
    const [, slotParam] = args

    const slot = Number(slotParam)
    if (!slotParam) {
        return await message.channel.send('No params provided')
    } else if (!isValidInteger(slot, 0, 9)) {
        return await message.channel.send('Slot must be an integer from 0 to 9')
    }

    try {
        await db.query('DELETE FROM slot WHERE guild_id = $1 AND slot_number = $2', [
            message.guild.id,
            slot
        ])

        guild.slots.delete(slot)
        await message.channel.send('Deleted')
    } catch (error) {
        console.error(error)
        return await message.channel.send('Something went wrong, try later')
    }

    return Promise.resolve()
}
