import { Guild } from 'discord.js'
import deleteGuildCascade from '../db/actions/delete-guild-cascade'
import { deleteGuildSession } from '../guild-sessions'
import { LogLevel } from '../journal'

export default async function onGuildDelete (guild: Guild): Promise<void> {
    await deleteGuildCascade(guild.id)
    deleteGuildSession(guild.id)

    console.log(`[${LogLevel.INFO}] Guild deleted: ${guild.name} (id: ${guild.id})`)
}
