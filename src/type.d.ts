import { Guild, VoiceChannel, StreamDispatcher, VoiceConnection } from 'discord.js'

export interface GuildConnection {
    guild: Guild
    volume: number
    queue: ShuffleableArray<string>
    dispatcher: StreamDispatcher
    connection: VoiceConnection
}

export interface Guilds {
    [key: string]: GuildConnection
}

export interface Track {
    name: string
    url: string
}

export interface ShuffleableArray<T> extends Array<T> {
    shuffle(): this
}
