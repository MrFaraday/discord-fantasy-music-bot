import { Client, Constants, DiscordAPIError, Message } from 'discord.js'
import { getGuildSession } from '../guild-sessions'
import commandHandlers from '../command-handlers'

export default async function commandDispatcher (
    this: Client,
    message: Message
): Promise<void> {
    if (!message.guild) return
    if (!this.user) return
    if (message.channel.type !== 'text' || message.author.id === this.user.id) return

    const guild = await getGuildSession(this, message.guild)
    const args = getCommandArgs(this.user.username, message.content.trim(), guild.prefix)

    try {
        await getCommandHandler(args).call(this, { message, guild, args })
    } catch (error) {
        if (
            error instanceof DiscordAPIError &&
            error.code === Constants.APIErrors.MISSING_PERMISSIONS
        ) {
            try {
                await message.react('🤐')
            } catch (error) {
                // not permissions
            }
        } else {
            console.warn('Message handler error:', error)
        }
    }
}

const getCommandHandler = (args: string[]) => {
    switch (args[0]) {
        case 'help':
            return commandHandlers.helpHandler
        case 'hello':
            return commandHandlers.greetingsHandler

        case 'prefix':
            return commandHandlers.prefixHandler

        // Standard command to play track or add it to a queue
        case 'p':
        case 'fp':
            return commandHandlers.playHandler

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
            return commandHandlers.playSlotHandler

        case 'save':
            return commandHandlers.saveHandler

        // Next song
        case 'n':
            return commandHandlers.nextHandler

        // Stoping
        case 's':
            return commandHandlers.stopHandler

        // Volume
        case 'v':
            return commandHandlers.volumeHandler

        // Disconnect
        case 'd':
            return commandHandlers.disconnectHandler

        default:
            return () => void 0
    }
}

const getCommandArgs = (clientName: string, message: string, prefix: string) => {
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
