import { Client, Message } from 'discord.js'
import youtubeApi from '../api/youtube-api'
import db from '../db'
import { isValidInteger } from '../utils/number'

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
        return await message.channel.send('No params provided')
    } else if (!isValidInteger(slot, 0, 9)) {
        return await message.channel.send('Slot must be an integer from 0 to 9')
    } else if (!url) {
        return await message.channel.send('No link provided')
    } else if (url.length > 500) {
        return await message.channel.send('Link is too long, maximum 500 of characters')
    } else if (!urlRegEx.test(url)) {
        return await message.channel.send('It\'s not a link, maybe')
    } else if (!(await youtubeApi.isSourceExist(url))) {
        return await message.channel.send(
            'Sorry, I followed a link and have found nothing'
        )
    } else if (slotName.length > 80) {
        return await message.channel.send('Name is too long, maximum 80 of characters')
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

        return await message.channel.send('Saved!')
    } catch (error) {
        // update error
        return await message.channel.send('Something went wrong, I\'ll find that soon')
    } finally {
        client.release()
    }
}
