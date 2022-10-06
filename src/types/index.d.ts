// Type definitions for discord-fantasy-music-bot
// Project: Shyrlonay - Fantasy Music Bot
// Definitions by: Dmitry Lyakhovich <faradayby@gmail.com>

type guildId = import('discord.js').Snowflake

interface MessageCommadHandlerParams {
    message: import('discord.js').Message
    guild: import('../guild-session').default
    args: string[]
    commands: Command<any>[]
}

interface InterationHandlerParams {
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

interface Command<T> {
    executor?: (
        this: Client,
        guild: import('../guild-session').default,
        params: T
    ) => Promise<any> | any
}

interface MessageCommand<T = unknown> extends Command<T> {
    commandMessageNames: string[]
    sort: number
    helpInfo?: string
    messageHandler(
        this: Client,
        { guild, message }: MessageCommadHandlerParams
    ): Promise<any> | any
}

interface InteractionCommand<T = unknown> extends Command<T> {
    commandInteractionNames: string[]
    interactionHandler(
        this: import('discord.js').Client,
        params: InterationHandlerParams
    ): Promise<any> | any
}

interface SlashCommand<T = unknown> extends InteractionCommand<T> {
    slashConfig: SlashConfig
}

type DiscordChannel =
    | import('discord.js').DMChannel
    | import('discord.js').PartialDMChannel
    | import('discord.js').NewsChannel
    | import('discord.js').TextChannel
    | import('discord.js').PublicThreadChannel
    | import('discord.js').PrivateThreadChannel
    | import('discord.js').VoiceChannel
