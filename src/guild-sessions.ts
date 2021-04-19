import { Client, Guild } from 'discord.js'
import GuildSession from './guild-session'
import GuildSessionFactory from './guild-session-factory'

const guildSessions = new Map<string, GuildSession>()

export async function getGuildSession (app: Client, guild: Guild): Promise<GuildSession> {
    const session = guildSessions.get(guild.id)

    if (!session) {
        const guildSession = await createGuildSession(app, guild)

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
    app: Client,
    guild: Guild
): Promise<GuildSession | undefined> {
    try {
        const sessionFactory = new GuildSessionFactory(app, guild)
        return await sessionFactory.createSession()
    } catch (error) {
        console.error('Connecting guild error:', error)
    }
}
