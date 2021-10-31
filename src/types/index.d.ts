// Type definitions for discord-fantasy-music-bot
// Project: Shyrlonay - Fantasy Music Bot
// Definitions by: Dmitry Lyakhovich <faradayby@gmail.com>

interface CommadHandlerParams {
    message: import('discord.js').Message
    guild: import('../guild-session').default
    args: string[]
    commands: Command[]
}

type Stream = import('stream').Readable // import('discord.js').AudioResource

interface Slot {
    name?: string
    value: string
}

type Slots = Map<number, Slot>

interface Command {
    aliases: string[]
    helpSort: number
    helpInfo?: string
    handler(this: import('discord.js').Client, params: CommadHandlerParams): any
}
