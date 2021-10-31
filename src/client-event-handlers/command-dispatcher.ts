import { Client, Constants, DiscordAPIError, Message, MessageMentions } from 'discord.js'
import { getGuildSession } from '../guild-sessions'
import commandHandlers from '../command-handlers'

export default async function commandDispatcher (
    this: Client,
    message: Message
): Promise<void> {
    if (!message.guild) return
    if (!this.user) return
    if (message.channel.type !== 'GUILD_TEXT' || message.author.id === this.user.id) return

    const guild = await getGuildSession(this, message.guild)
    const args = getCommandArgs(this.user.id, message, guild.prefix)

    try {
        await getCommandHandler(args).call(this, { message, guild, args })
    } catch (error) {
        if (
            error instanceof DiscordAPIError &&
            error.code === Constants.APIErrors.MISSING_PERMISSIONS
        ) {
            message.react('🤐').catch(() => 0)
        } else {
            console.error('Message handler error:', error)
        }
    }
}

const getCommandHandler = (args: string[]) => {
    switch (args[0]?.toLocaleLowerCase()) {
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

        case 'slots':
            return commandHandlers.slotsHandler

        case 'save':
            return commandHandlers.saveHandler

        case 'drop':
            return commandHandlers.dropHandler

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

        case 'summon':
            return commandHandlers.summonHandler

        case 'now':
            return commandHandlers.nowHandler

        default:
            return () => void 0
    }
}

const mentionRegExs = [
    new RegExp(MessageMentions.USERS_PATTERN.source),
    new RegExp(MessageMentions.CHANNELS_PATTERN.source),
    new RegExp(MessageMentions.EVERYONE_PATTERN.source),
    new RegExp(MessageMentions.ROLES_PATTERN.source)
]
const getCommandArgs = (clientId: string, message: Message, prefix: string) => {
    const messageContent = message.content.trim()

    const isStartsWithPrefix = messageContent.startsWith(prefix)
    const { mentions } = message
    const isMentioned =
        mentions.users.has(clientId) &&
        mentions.users.size === 1 &&
        !mentions.everyone &&
        mentions.channels.size === 0 &&
        mentions.crosspostedChannels.size === 0 &&
        mentions.roles.size === 0

    if (!isStartsWithPrefix && !isMentioned && !!prefix) return []

    const parts = messageContent
        .slice(isStartsWithPrefix ? prefix.length : 0)
        .split(' ')
        .map((arg) => arg.trim())
        .filter((arg) => arg)
        .filter((arg) => !mentionRegExs.some((regex) => regex.test(arg)))

    return parts
}
