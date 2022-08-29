import { AudioResource, createAudioResource } from '@discordjs/voice'
import { EmbedBuilder } from 'discord.js'
import { EMBED_COLOR } from './config'
import { GuildJournal } from './journal'
import { stream as getStream } from 'play-dl'

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

    private attempts = 0

    constructor (trackData: TrackData) {
        this.url = trackData.url
        this.title = trackData.title
        this.thumbnail = trackData.thumbnail
    }

    getMessageEmbed (): EmbedBuilder {
        const embed = new EmbedBuilder({
            title: this.title,
            color: EMBED_COLOR
        }).setURL(this.url)

        if (this.thumbnail) {
            embed.setThumbnail(this.thumbnail)
        }

        return embed
    }

    public async createAudioResource (guildId: string): Promise<AudioResource<Track>> {
        const journal = new GuildJournal(guildId)

        if (this.attempts >= maxAttempts) {
            journal.error(`MAX ATTEMPTS EXCEEDED: ${this.url}`)
            throw new CreateResourceError(CreateResourceError.MAX_ATTEMPTS_EXCEEDED)
        }

        try {
            this.attempts++

            const stream = await getStream(this.url)
            return createAudioResource(stream.stream, {
                inlineVolume: true,
                metadata: this,
                inputType: stream.type
            })
        } catch (error) {
            if (error instanceof Error && error.message === 'Got 429 from the request') {
                journal.log(`429: ${this.url}\n`, error, '\n', 'retrying...')

                return this.createAudioResource(guildId)
            } else if (
                error instanceof Error &&
                error.message.includes('While getting info from url')
            ) {
                throw new CreateResourceError(CreateResourceError.RESTRICTED)
            } else {
                journal.error(`UNHANDLED ERROR: ${this.url}\n`, error)

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
