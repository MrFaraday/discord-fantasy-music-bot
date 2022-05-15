import db from '..'
import { concatMessages, LogLevel } from '../../journal'

export default async function deleteGuildCascade (guildId: string): Promise<boolean> {
    const client = await db.getClient()

    try {
        await client.query(
            'DELETE FROM bind WHERE guild_id IN (SELECT id FROM guild) AND guild_id = $1',
            [guildId]
        )
        await client.query(
            'DELETE FROM guild_log WHERE guild_id IN (SELECT id FROM guild) AND guild_id = $1',
            [guildId]
        )

        await client.query('DELETE FROM guild WHERE id = $1', [guildId])

        return true
    } catch (error) {
        console.error(
            `[${LogLevel.ERROR}] Error on guildDelete ${guildId} \n`,
            concatMessages(error)
        )

        return false
    } finally {
        client.release()
    }
}
