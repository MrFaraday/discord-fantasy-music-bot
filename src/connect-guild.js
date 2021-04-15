const format = require('pg-format')
const db = require('./db')
const GuildConnection = require('./guild-connection')

const defaultPrefix = ''
const defaultVolume = 100
const defaultSlots = require('./config/default-slots.config.json')

const getDefaultSlotsInsertData = (guildId) =>
    defaultSlots.map((s) => [guildId, s.slot, s.value, s.name])

/**
 * @param { import('discord.js').Guild } guild
 * @param { import('discord.js').Client } app
 */
module.exports = async function connectGuild (guild, app) {
    const client = await db.getClient()

    try {
        const [guildData] = (
            await client.query('SELECT command_prefix, volume FROM guild WHERE id = $1', [
                String(guild.id)
            ])
        ).rows

        if (guildData) {
            return await loadGuild(app, guild, client, guildData)
        } else {
            return await registerGuild(app, guild, client)
        }
    } catch (error) {
        console.error('Connecting guild error')
        console.error(error)
    } finally {
        client.release()
    }
}

const loadGuild = async (app, guild, client, guildData) => {
    /**
     * @type { Slots }
     */
    const slots = new Map()

    const fetchSlotsQuery = (
        await client.query('SELECT slot_number, value, name FROM slot WHERE guild_id = $1', [
            String(guild.id)
        ])
    ).rows

    fetchSlotsQuery.forEach((slot) =>
        slots.set(slot.slot_number, { value: slot.value, name: slot.name })
    )

    const { command_prefix, volume } = guildData

    return new GuildConnection({ app, guild, slots, prefix: command_prefix, volume })
}

const registerGuild = async (app, guild, client) => {
    /**
     * @type { Slots }
     */
    const slots = new Map()

    defaultSlots.forEach((slot) => {
        slots.set(slot.slot, { name: slot.name, value: slot.value })
    })

    const prefix = defaultPrefix
    const volume = defaultVolume

    const registrateGuildQuery =
        'INSERT INTO guild (id, command_prefix, volume) VALUES ($1, $2, $3)'
    await client.query(registrateGuildQuery, [String(guild.id), prefix, volume])
    const insertDefaultSlotsQuery = format(
        'INSERT INTO slot (guild_id, slot_number, value, name) VALUES %L',
        getDefaultSlotsInsertData(guild.id)
    )
    await client.query(insertDefaultSlotsQuery)

    return new GuildConnection({ app, guild, slots, prefix, volume })
}
