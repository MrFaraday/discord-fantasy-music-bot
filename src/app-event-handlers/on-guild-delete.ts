import { Guild } from 'discord.js'
import deleteGuildCascade from '../db/actions/delete-guild-cascade'

export default async function onGuildDelete (guild: Guild): Promise<void> {
    await deleteGuildCascade(guild.id)
}
