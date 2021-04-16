import { Guild } from 'discord.js'
import db from '../db'

export default async function onGuildDelete (guild: Guild): Promise<void> {
    const client = await db.getClient()

    try {
        await client.query(
            'DELETE FROM slot WHERE guild_id IN (SELECT id FROM guild) AND guild_id = $1',
            [String(guild.id)]
        )
        await client.query('DELETE FROM guild WHERE id = $1', [String(guild.id)])
    } catch (error) {
        console.error('Error on guildDelete')
        console.error(error)
    } finally {
        client.release()
    }
}
