const { Constants, MessageEmbed } = require('discord.js')
const guilds = require('./guilds')
const connectGuild = require('./connect-guild')

/**
 * @param { import('discord.js').Message } message
 * @this { import('discord.js').Client }
 */
module.exports = async function messageDispatcher (message) {
    if (message.channel.type !== 'text') return
    if (message.type === 'GUILD_MEMBER_JOIN' && message.author.id === this.user.id)
        message.channel.send(joinGreetings)

    const { id: guildId } = message.guild

    if (!guilds.has(guildId)) {
        const guildConnection = await connectGuild(message.guild, this)

        if (!guildConnection) {
            return // message.reply('Sorry... I seem to be having trouble')
        }

        guilds.set(guildId, guildConnection)
    }

    const guild = guilds.get(guildId)
    const args = getCommandArgs(this.user.username, message.content.trim(), guild.prefix)

    try {
        return await getMessageHandler(args)({ message, guild, args, app: this })
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
const getMessageHandler = (args) => {
    switch (args[0]) {
        case 'help':
            return require('./message-handlers/help')
        case 'hello':
            return require('./message-handlers/greetings')

        case 'prefix':
            return require('./message-handlers/prefix')

        // Standard command to play track or add it to a queue
        case 'p':
        case 'fp':
            return require('./message-handlers/play')

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
            return require('./message-handlers/play-slot')

        case 'save':
            return require('./message-handlers/save')

        // Next song
        case 'n':
            return require('./message-handlers/next')

        // Stoping
        case 's':
            return require('./message-handlers/stop')

        // Volume
        case 'v':
            return require('./message-handlers/volume')

        // Disconnect
        case 'd':
            return require('./message-handlers/disconnect')

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

const joinGreetings = new MessageEmbed().setDescription('Yeeeee')
