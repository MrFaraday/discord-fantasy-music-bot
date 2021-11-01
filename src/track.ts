import { AudioResource, createAudioResource } from '@discordjs/voice'
import { MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from './config'
import ytdl from 'ytdl-core-discord'

const maxAttempts = 3

interface TrackData {
    url: string
    title: string
    thumbnail?: string
}

export class Track implements TrackData {
    public readonly url: string
    public readonly title: string
    public readonly thumbnail?: string
    public attempts = 0

    constructor (trackData: TrackData) {
        this.url = trackData.url
        this.title = trackData.title
        this.thumbnail = trackData.thumbnail
    }

    getMessageEmbed (): MessageEmbed {
        const embed = new MessageEmbed({
            title: this.title,
            color: EMBED_COLOR
        }).setURL(this.url)

        if (this.thumbnail) {
            embed.setThumbnail(this.thumbnail)
        }

        return embed
    }

    public async createAudioResource (): Promise<AudioResource<Track>> {
        if (this.attempts > maxAttempts) {
            console.log('MAX ATTEMPTS EXCEEDED')
            throw new CreateResourceError(CreateResourceError.MAX_ATTEMPTS_EXCEEDED)
        }

        try {
            this.attempts++
            const stream: Stream = await ytdl(this.url)

            return createAudioResource(stream, {
                metadata: this,
                inlineVolume: true
            })
        } catch (error) {
            if (error instanceof Error && error?.message === 'Video unavailable') {
                throw new CreateResourceError(
                    CreateResourceError.UNAVAILABLE,
                    'Video unavailable'
                )
            } else if (error instanceof Error && error.message === 'Status code: 410') {
                throw new CreateResourceError(CreateResourceError.RESTRICTED)
            } else {
                console.error('>> UNHANDLED createAudioResource error')
                console.error(this)
                console.error(error)
                throw new CreateResourceError(CreateResourceError.UNKNOWN)
            }
        }
    }
}

export class CreateResourceError extends Error {
    public static UNAVAILABLE = 0
    public static MAX_ATTEMPTS_EXCEEDED = 1
    public static UNKNOWN = 2
    public static RESTRICTED = 3

    public code: number | null = null

    constructor (code: number, message?: string) {
        super(message)
        this.code = code

        Object.setPrototypeOf(this, CreateResourceError.prototype)
    }
}
