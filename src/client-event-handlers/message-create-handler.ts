import { Client, Constants, DiscordAPIError, Message, MessageMentions } from 'discord.js'
import { getGuildSession } from '../guild-sessions'
import * as ClientCommands from '../client-commands'

const commands: ClientCommand[] = Object.values(ClientCommands)
commands.sort((a, b) => a.sort - b.sort)

export default async function messageCreateHandler (
    this: Client,
    message: Message
): Promise<void> {
    if (!message.guild) return
    if (!this.user) return
    if (message.channel.type !== 'GUILD_TEXT' || message.author.id === this.user.id)
        return

    const guild = await getGuildSession(this, message.guild)
    const args = getCommandArgs(this.user.id, message, guild.prefix)

    try {
        const command = commands.find((c) =>
            c.aliases.includes(args[0]?.toLocaleLowerCase())
        )

        if (command) {
            await command.handler.call(this, { message, guild, args, commands })
        }
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
