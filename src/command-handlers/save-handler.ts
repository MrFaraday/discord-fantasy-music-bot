import { Client, Message } from 'discord.js'
import db from '../db'

const urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/

export default async function saveHandler (
    this: Client,
    { guild, args, message }: CommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return

    const [, slotParam, url] = args
    const slotName = args.slice(3).join(' ')

    const slot = Number(slotParam)

    if (!slotParam) {
        return await message.reply('No params provided')
    } else if (Number.isNaN(slotParam)) {
        return await message.reply('Slot must be a number')
    } else if (!Number.isInteger(slot)) {
        return await message.reply('Slot number must be integer')
    } else if (slot < 0 || slot > 9) {
        return await message.reply('Slot number must be from 0 to 9')
    } else if (!url) {
        return await message.reply('No URL provided')
    } else if (url.length > 500) {
        return await message.reply('Too long URL, maximum 500 of characters')
    } else if (!urlRegEx.test(url)) {
        return await message.reply('It\'s not an URL, maybe')
    } else if (slotName.length > 80) {
        return await message.reply('Name is too long, maximum 80 of characters')
    }

    guild.slots.set(slot, { name: slotName, value: url })

    const client = await db.getClient()
    const guildId = message.guild.id

    try {
        const [record] = (
            await client.query(
                `
                SELECT slot_number FROM slot
                WHERE guild_id = $1 AND slot_number = $2
                `,
                [guildId, slot]
            )
        ).rows

        if (record) {
            await client.query(
                `
                UPDATE slot SET slot_number = $2, value = $3, name = $4
                WHERE guild_id = $1 AND slot_number = $2
                `,
                [guildId, slot, url, slotName || null]
            )
        } else {
            await client.query(
                `
                INSERT INTO slot (guild_id, slot_number, value, name)
                VALUES ($1, $2, $3, $4)
                `,
                [guildId, slot, url, slotName || null]
            )
        }

        return await message.reply('Saved!')
    } catch (error) {
        // update error
        return await message.reply('Something went wrong. I\'ll find that soon')
    } finally {
        client.release()
    }
}
