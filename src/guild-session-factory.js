const db = require('./db')

const defaultPrefix = ''
const defaultVolume = 100
const defaultSlots = require('./config/default-slots.config.json')
const format = require('pg-format')
const GuildSession = require('./guild-session')

module.exports = class GuildSessionFactory {
    /**
     * @param { import('discord.js').Client } app
     * @param { import('discord.js').Guild } guild
     */
    constructor (app, guild) {
        this.app = app
        this.guild = guild
    }

    async createSession () {
        this.client = await db.getClient()

        try {
            const [guildData] = (
                await this.client.query('SELECT command_prefix, volume FROM guild WHERE id = $1', [
                    String(this.guild.id)
                ])
            ).rows

            this.guildData = guildData

            if (guildData) {
                return await this.loadGuild()
            } else {
                return await this.registerGuild()
            }
        } catch (error) {
            console.error('Connecting guild error')
            console.error(error)
        } finally {
            this.client.release()
        }
    }

    async loadGuild () {
        /**
         * @type { Slots }
         */
        const slots = new Map()

        const fetchSlotsQuery = (
            await this.client.query(
                'SELECT slot_number, value, name FROM slot WHERE guild_id = $1',
                [String(this.guild.id)]
            )
        ).rows

        fetchSlotsQuery.forEach((slot) =>
            slots.set(slot.slot_number, { value: slot.value, name: slot.name })
        )

        const { command_prefix, volume } = this.guildData

        return new GuildSession({
            app: this.app,
            guild: this.guild,
            slots,
            prefix: command_prefix,
            volume
        })
    }

    async registerGuild () {
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
        await this.client.query(registrateGuildQuery, [String(this.guild.id), prefix, volume])
        const insertDefaultSlotsQuery = format(
            'INSERT INTO slot (guild_id, slot_number, value, name) VALUES %L',
            this.getDefaultSlotsInsertData()
        )
        await this.client.query(insertDefaultSlotsQuery)

        return new GuildSession({ app: this.app, guild: this.guild, slots, prefix, volume })
    }

    getDefaultSlotsInsertData () {
        return defaultSlots.map((s) => [this.guild.id, s.slot, s.value, s.name])
    }
}
