interface HandlerParams {
    message: import('discord.js').Message
    guild: import('../guild-connection')
    args: string[]
}

type MessageHandler = (params: HandlerParams) => Promise<void>
type GuildId = string
type Stream = string | import('discord.js').VoiceBroadcast | import('stream').Readable

interface Track {
    title: string
    getStream(): Promise<Stream>
    meta?: [string, string][]
}
