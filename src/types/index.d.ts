interface HandlerParams {
    app: import('discord.js').Client
    message: import('discord.js').Message
    guild: import('../guild-connection')
    args?: string[]
}

type MessageHandler = (params: HandlerParams) => Promise<void | Message>
type GuildId = string
type Stream = string | import('discord.js').VoiceBroadcast | import('stream').Readable

interface Track {
    title: string
    getStream(): Promise<Stream>
    meta?: [string, string][]
}

type Slots = Map<number, { name: string, value: string }>
