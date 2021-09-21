// Type definitions for discord-fantasy-music-bot
// Project: Shyrlonay - Fantasy Music Bot
// Definitions by: Dmitry Lyakhovich <faradayby@gmail.com>

interface CommadHandlerParams {
    message: import('discord.js').Message
    guild: import('../guild-session').default
    args: string[]
}

type Stream = any // import('discord.js').AudioResource

interface Track {
    title: string
    getStream(): Promise<Stream>
    meta?: [string, string][]
}

interface Slot {
    name?: string
    value: string
}

type Slots = Map<number, Slot>
