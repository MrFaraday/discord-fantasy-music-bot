import {
    ChannelType,
    Client,
    DiscordAPIError,
    Message,
    MessageMentions
} from 'discord.js'
import { getGuildSession } from '../guild-sessions'
import { messageCommands } from '../commands'

export default async function messageCreateHandler (
    this: Client,
    message: Message
): Promise<void> {
    if (!message.guild) return
    if (!this.user) return
    if (
        message.channel.type !== ChannelType.GuildText ||
        message.author.id === this.user.id
    )
        return

    const guild = await getGuildSession(this, message.guild)
    const args = getCommandArgs(this.user.id, message, guild.prefix)

    try {
        const command = messageCommands.find((c) =>
            c.commandMessageNames.includes(args[0]?.toLocaleLowerCase())
        )

        if (command) {
            guild.journal.log(
                'message',
                message.id,
                'emited message command',
                command?.commandMessageNames
            )

            await Promise.all([
                guild.controller.updateActivity(),

                command.messageHandler.call(this, {
                    message,
                    guild,
                    args,
                    commands: messageCommands
                })
            ])
        }
    } catch (error) {
        if (
            error instanceof DiscordAPIError
            // error.code === Constants.APIErrors.MISSING_PERMISSIONS // TODO: permissions check
        ) {
            message.react('🤐').catch(() => 0)
        } else {
            guild.journal.error('Message handler error', error)
        }
    }
}

const mentionRegExs = [
    new RegExp(MessageMentions.UsersPattern.source),
    new RegExp(MessageMentions.ChannelsPattern.source),
    new RegExp(MessageMentions.EveryonePattern.source),
    new RegExp(MessageMentions.RolesPattern.source)
]
const getCommandArgs = (clientId: string, message: Message, prefix: string) => {
    const messageContent = message.content.trim()

    const startsWithPrefix = messageContent.startsWith(prefix)
    const { mentions } = message
    const mentioned =
        mentions.users.has(clientId) &&
        mentions.users.size === 1 &&
        !mentions.everyone &&
        mentions.channels.size === 0 &&
        mentions.crosspostedChannels.size === 0 &&
        mentions.roles.size === 0

    if (!startsWithPrefix && !mentioned && !!prefix) return []

    const parts = messageContent
        .slice(startsWithPrefix ? prefix.length : 0)
        .split(' ')
        .map((arg) => arg.trim())
        .filter((arg) => arg)
        .filter((arg) => !mentionRegExs.some((regex) => regex.test(arg)))

    return parts
}
