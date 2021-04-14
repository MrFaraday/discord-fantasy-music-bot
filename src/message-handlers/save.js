const db = require('../db')

const urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/

/**
 * @type { MessageHandler }
 */
module.exports = async function save ({ guild, args, message }) {
    const [, slotParam, url, slotName] = args
    const slot = Number(slotParam)

    if (!slotParam) {
        return message.reply('No params provided')
    } else if (Number.isNaN(slotParam)) {
        return message.reply('Slot must be a number')
    } else if (!Number.isInteger(slot)) {
        return message.reply('Slot number must be integer')
    } else if (slot < 0 || slot > 9) {
        return message.reply('Slot number must be from 0 to 9')
    } else if (!url) {
        return message.reply('No URL provided')
    } else if (url.length > 255) {
        return message.reply('Too long URL, maximum 255 of characters')
    } else if (!urlRegEx.test(url)) {
        return message.reply('It\'s not an URL, maybe')
    } else if (slotName && slotName.length > 50) {
        return message.reply('Name is too long, maximum 50 of characters')
    }

    guild.slots.set(slot, { name: slotName, value: url })

    const client = await db.getClient()
    const guildId = String(message.guild.id)

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
    } catch (error) {
        // update error
    } finally {
        client.release()
    }

    return message.reply('Saved!')
}
