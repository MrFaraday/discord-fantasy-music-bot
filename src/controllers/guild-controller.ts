/**
 * Guild controller
 *
 * @todo add methods
 */

import { Guild } from 'discord.js'
import db from '../db'

export default class GuildController {
    guild: Guild

    constructor (guild: Guild) {
        this.guild = guild
    }

    async updateActivity () {
        await db.query('UPDATE guild SET was_active_at = now() WHERE id = $1', [this.guild.id])
    }
}
