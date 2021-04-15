const GuildSessionFactory = require('./guild-session-factory')

/**
 * @type { Map<GuildId, import('./guild-session')> }
 */
const guildSessions = new Map()

/**
 * @param { import('discord.js').Client } app
 * @param { import('discord.js').Guild } guild
 */
module.exports.getGuildSession = async function (app, guild) {
    if (!guildSessions.has(guild.id)) {
        const sessionFactory = new GuildSessionFactory(app, guild)

        const guildSession = await sessionFactory.createSession()

        if (!guildSession) {
            return // message.reply('Sorry... I seem to be having trouble')
        }

        guildSessions.set(guild.id, guildSession)
    }

    return guildSessions.get(guild.id)
}
