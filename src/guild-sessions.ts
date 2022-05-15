import { Client, Guild } from 'discord.js'
import GuildSession from './guild-session'
import GuildSessionFactory from './guild-session-factory'
import { GuildJournal } from './journal'

const guildSessions = new Map<string, GuildSession>()

export async function getGuildSession (
    client: Client,
    guild: Guild
): Promise<GuildSession> {
    const session = guildSessions.get(guild.id)

    if (!session) {
        const guildSession = await createGuildSession(client, guild)

        if (!guildSession) {
            throw new Error('Failed to create guild session')
        }

        guildSessions.set(guild.id, guildSession)
        return guildSession
    }

    return session
}

export function deleteGuildSession (guildId: string): void {
    guildSessions.delete(guildId)
}

async function createGuildSession (
    client: Client,
    guild: Guild
): Promise<GuildSession | undefined> {
    try {
        const sessionFactory = new GuildSessionFactory(client, guild)
        return await sessionFactory.createSession()
    } catch (error) {
        new GuildJournal(guild.id).error('Connecting guild error:', '\n', error)
    }
}
