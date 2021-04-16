const { Constants } = require('discord.js')
const { getGuildSession } = require('../guild-sessions')

/**
 * @param { import('discord.js').Message } message
 * @this { import('discord.js').Client }
 */
module.exports = async function messageDispatcher (message) {
    if (message.channel.type !== 'text' || message.author.id === this.user.id) return

    const guild = await getGuildSession(this, message.guild)
    const args = getCommandArgs(this.user.username, message.content.trim(), guild.prefix)

    try {
        return await getCommandHandler(args).call(this, { message, guild, args })
    } catch (error) {
        if (error.code === Constants.APIErrors.MISSING_PERMISSIONS) {
            try {
                message.react('🤐')
            } catch (error) {
                // not permissions
            }
        } else {
            console.warn('Message handler error:', error)
        }
    }
}

/**
 * @param { string[] } args
 */
const getCommandHandler = (args) => {
    switch (args[0]) {
        case 'help':
            return require('../command-handlers/help')
        case 'hello':
            return require('../command-handlers/greetings')

        case 'prefix':
            return require('../command-handlers/prefix')

        // Standard command to play track or add it to a queue
        case 'p':
        case 'fp':
            return require('../command-handlers/play')

        // Play saved url
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            return require('../command-handlers/play-slot')

        case 'save':
            return require('../command-handlers/save')

        // Next song
        case 'n':
            return require('../command-handlers/next')

        // Stoping
        case 's':
            return require('../command-handlers/stop')

        // Volume
        case 'v':
            return require('../command-handlers/volume')

        // Disconnect
        case 'd':
            return require('../command-handlers/disconnect')

        default:
            return () => 0
    }
}

/**
 * @param { string } clientName
 * @param { string } message
 * @param { string } prefix
 */
const getCommandArgs = (clientName, message, prefix) => {
    const universalPrefix = `${clientName}!`
    const parts = message
        .split(' ')
        .map((arg) => arg.trim())
        .filter((arg) => arg)

    if (parts[0] === universalPrefix) {
        return parts.slice(1)
    } else if (parts[0] && parts[0].startsWith(prefix)) {
        parts[0] = parts[0].substr(prefix.length)
        return parts
    } else {
        return []
    }
}
