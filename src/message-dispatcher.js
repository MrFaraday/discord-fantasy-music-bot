const { PREFIX } = require('./config')
const GuildConnection = require('./guild-connection')

/**
 * @type { Map<GuildId, GuildConnection> }
 */
const guilds = new Map()

/**
 * @param { import('discord.js').Message } message
 */
module.exports = async function messageDispatcher (message) {
    const { id: guildId } = message.guild
    const args = message.content
        .split(' ')
        .map((arg) => arg.trim())
        .filter((arg) => arg)

    if (PREFIX && args[0] !== PREFIX) return
    else if (PREFIX) args.shift()

    if (!guilds.has(guildId)) {
        guilds.set(guildId, new GuildConnection(message.guild))
    }

    const guild = guilds.get(guildId)

    try {
        return await getMessageHandler(args)({ message, guild, args })
    } catch (error) {
        console.warn('Message handler error:', error)
    }
}

const getMessageHandler = (args) => {
    switch (args[0].trim()) {
        case 'hello':
            return require('./message-handlers/greetings')

        // Standard command to play track or add it to a queue
        case 'p':
        case 'fp':
            return require('./message-handlers/play')

        // Play preset
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
            return require('./message-handlers/play-preset')

        // Next song
        case 'n':
            return require('./message-handlers/next')

        // Stoping
        case 's':
            return require('./message-handlers/stop')

        // Volume
        case 'v':
            return require('./message-handlers/volume')

        default:
            return () => 0
    }
}
