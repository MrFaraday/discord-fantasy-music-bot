import { Guild } from 'discord.js'
import deleteGuildCascade from '../db/actions/delete-guild-cascade'
import { deleteGuildSession } from '../guild-sessions'

export default async function onGuildDelete (guild: Guild): Promise<void> {
    await deleteGuildCascade(guild.id)
    deleteGuildSession(guild.id)
}
