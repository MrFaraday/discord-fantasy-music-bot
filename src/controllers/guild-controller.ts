/**
 * Guild controller
 *
 * @todo add methods
 */

import db from '../db'

export default class GuildController {
    guildId: string

    constructor (guildId: string) {
        this.guildId = guildId
    }

    async updateActivity () {
        await db.query('UPDATE guild SET was_active_at = now() WHERE id = $1', [this.guildId])
    }
}
