// Type definitions for discord-fantasy-music-bot
// Project: Shyrlonay - Fantasy Music Bot
// Definitions by: Dmitry Lyakhovich <faradayby@gmail.com>

interface MessageCommadHandlerParams {
    message: import('discord.js').Message
    guild: import('../guild-session').default
    args: string[]
    commands: ClientCommand[]
}

interface InteractionHandlerParams {
    interaction: import('discord.js').Interaction
    guild: import('../guild-session').default
}

type Stream = import('stream').Readable // import('discord.js').AudioResource

interface Bind {
    name?: string
    value: string
}

type Binds = Map<number, Bind>
type SlashConfig =
    | import('@discordjs/builders').SlashCommandBuilder
    | Omit<
          import('@discordjs/builders').SlashCommandBuilder,
          'addSubcommand' | 'addSubcommandGroup'
      >

interface ClientCommand {
    aliases: string[]
    sort?: number
    helpInfo?: string
    slashConfig: SlashConfig
    handler(this: Client, { guild, message }: MessageCommadHandlerParams): Promise<any>
}

interface InteractionCommand {
    interactionIds: string[]
    handler(this: import('discord.js').Client, params: InteractionHandlerParams): any
}
