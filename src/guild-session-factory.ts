import db, { DbClient } from './db'
import { Client, Guild } from 'discord.js'
import GuildSession from './guild-session'
import defaultBinds from './config/default-binds.config.json'
import format from 'pg-format'
import { DEFAULT_PREFIX, DEFAULT_VOLUME } from './config'

interface GuildData {
    command_prefix: string
    volume: number
}

interface BindData {
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

        const binds = new Map<number, Bind>()

        const fetchBindsQuery = (
            await this.dbClient.query<BindData>(
                'SELECT slot_number, value, name FROM slot WHERE guild_id = $1',
                [String(this.guild.id)]
            )
        ).rows

        fetchBindsQuery.forEach((bind) =>
            binds.set(bind.slot_number, { value: bind.value, name: bind.name })
        )

        const { command_prefix, volume } = this.guildData

        return new GuildSession({
            guild: this.guild,
            binds,
            prefix: command_prefix,
            volume
        })
    }

    async registerGuild (): Promise<GuildSession> {
        if (!this.dbClient) {
            throw new Error('No DbClient instance')
        }

        const binds = new Map<number, Bind>()

        defaultBinds.forEach((bind) => {
            binds.set(bind.key, { name: bind.name, value: bind.value })
        })

        const prefix = DEFAULT_PREFIX
        const volume = DEFAULT_VOLUME

        const registrateGuildQuery =
            'INSERT INTO guild (id, command_prefix, volume) VALUES ($1, $2, $3)'
        await this.dbClient.query(registrateGuildQuery, [this.guild.id, prefix, volume])

        const insertDefaultBindsQuery = format(
            'INSERT INTO slot (guild_id, slot_number, value, name) VALUES %L',
            this.getDefaultBindsInsertData()
        )
        await this.dbClient.query(insertDefaultBindsQuery)

        return new GuildSession({ guild: this.guild, binds: binds, prefix, volume })
    }

    getDefaultBindsInsertData (): [string, number, string, string][] {
        return defaultBinds.map((s) => [this.guild.id, s.key, s.value, s.name])
    }
}
