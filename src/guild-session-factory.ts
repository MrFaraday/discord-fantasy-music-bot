import db, { DbClient } from './db'
import { Client, Guild } from 'discord.js'
import GuildSession from './guild-session'
import defaultSlots from './config/default-slots.config.json'
import format from 'pg-format'
import { DEFAULT_PREFIX, DEFAULT_VOLUME } from './config'

interface GuildData {
    command_prefix: string
    volume: number
}

interface SlotData {
    slot_number: number
    value: string
    name: string
}

export default class GuildSessionFactory {
    client: Client
    guild: Guild

    dbClient?: DbClient
    guildData?: GuildData

    constructor (client: Client, guild: Guild) {
        this.client = client
        this.guild = guild
    }

    async createSession (): Promise<GuildSession> {
        this.dbClient = await db.getClient()

        try {
            const result = (
                await this.dbClient.query<GuildData>(
                    'SELECT command_prefix, volume FROM guild WHERE id = $1',
                    [String(this.guild.id)]
                )
            ).rows

            this.guildData = result[0]

            if (this.guildData) {
                return await this.loadGuild()
            } else {
                return await this.registerGuild()
            }
        } finally {
            this.dbClient.release()
        }
    }

    async loadGuild (): Promise<GuildSession> {
        if (!this.dbClient || !this.guildData) {
            throw new Error('No DbClient instance or guildData')
        }

        const slots = new Map<number, Slot>()

        const fetchSlotsQuery = (
            await this.dbClient.query<SlotData>(
                'SELECT slot_number, value, name FROM slot WHERE guild_id = $1',
                [String(this.guild.id)]
            )
        ).rows

        fetchSlotsQuery.forEach((slot) =>
            slots.set(slot.slot_number, { value: slot.value, name: slot.name })
        )

        const { command_prefix, volume } = this.guildData

        return new GuildSession({
            guild: this.guild,
            slots,
            prefix: command_prefix,
            volume
        })
    }

    async registerGuild (): Promise<GuildSession> {
        if (!this.dbClient) {
            throw new Error('No DbClient instance')
        }

        const slots = new Map<number, Slot>()

        defaultSlots.forEach((slot) => {
            slots.set(slot.slot, { name: slot.name, value: slot.value })
        })

        const prefix = DEFAULT_PREFIX
        const volume = DEFAULT_VOLUME

        const registrateGuildQuery =
            'INSERT INTO guild (id, command_prefix, volume) VALUES ($1, $2, $3)'
        await this.dbClient.query(registrateGuildQuery, [this.guild.id, prefix, volume])

        const insertDefaultSlotsQuery = format(
            'INSERT INTO slot (guild_id, slot_number, value, name) VALUES %L',
            this.getDefaultSlotsInsertData()
        )
        await this.dbClient.query(insertDefaultSlotsQuery)

        return new GuildSession({ guild: this.guild, slots, prefix, volume })
    }

    getDefaultSlotsInsertData (): [string, number, string, string][] {
        return defaultSlots.map((s) => [this.guild.id, s.slot, s.value, s.name])
    }
}
