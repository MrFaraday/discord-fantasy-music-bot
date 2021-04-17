import { Guild, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js'
import shuffle from 'lodash.shuffle'
import fadeOut from './easing/fade-out'

interface SessionConstructorParams {
    guild: Guild
    slots: Slots
    prefix: string
    volume: number
}

export default class GuildSession {
    guild: Guild
    slots: Slots
    prefix: string
    volume: number

    private queue: Track[] = []
    private connection: VoiceConnection | null = null
    private dispatcher: StreamDispatcher | null = null
    private disconnectTimeout: NodeJS.Timeout | null = null

    constructor ({ guild, slots, prefix, volume }: SessionConstructorParams) {
        this.guild = guild
        this.volume = volume
        this.prefix = prefix
        this.slots = slots
    }

    async play (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        tracks.forEach((track) => this.queue.push(track))

        if (!this.connection) {
            await this.connect(channel)
        } else if (!this.dispatcher) {
            await this.createDispatcher()
        }
    }

    /**
     * Force playing
     */
    async forcePlay (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        this.queue = shuffle(tracks)

        if (!this.connection) {
            await this.connect(channel)
        } else if (this.dispatcher) {
            fadeOut(this.dispatcher)
        } else {
            await this.createDispatcher()
        }
    }

    /**
     * Volume changing
     */
    changeVolume (volume: number): void {
        this.volume = volume

        if (this.dispatcher) {
            this.dispatcher.setVolume(this.dispatcherVolume)
        }
    }

    /**
     * Skipping
     */
    skip (): void {
        if (this.dispatcher) {
            fadeOut(this.dispatcher)
        }
    }

    /**
     * Stopping
     */
    stop (): void {
        if (this.dispatcher) {
            this.queue = []
            fadeOut(this.dispatcher)
        }
    }

    /**
     * Checking playing status
     */
    isPlaying (): boolean {
        return !!this.dispatcher
    }

    disconnect (): void {
        this.queue = []

        if (this.dispatcher) {
            this.dispatcher.end()
        }

        if (this.connection) {
            this.connection.disconnect()
        }
    }

    private get dispatcherVolume () {
        const v = 0.005 * this.volume
        return v
    }

    /**
     * Connecting to a voice channel
     */
    private async connect (channel: VoiceChannel) {
        this.connection = await channel.join()
        await this.createDispatcher()

        this.connection.on('disconnect', () => {
            this.queue = []
            this.connection = null

            if (this.dispatcher) {
                this.dispatcher.end()
            }
        })
    }

    /**
     * Creating dispatcher and event listeners
     */
    private async createDispatcher () {
        if (!this.connection) {
            throw new Error('Tried to create dispatcher with inexisting voice connection')
        }

        const track = this.queue.shift()

        if (!track) {
            this.scheduleDisconnect()
            this.dispatcher = null
            return
        }

        try {
            const stream = await track.getStream()

            this.dispatcher = this.connection.play(stream, {
                volume: this.dispatcherVolume,
                type: 'opus'
            })

            if (this.disconnectTimeout) {
                clearTimeout(this.disconnectTimeout)
            }

            // End of track
            this.dispatcher.on('end', () => this.createDispatcher())
            this.dispatcher.on('finish', () => this.createDispatcher())

            this.dispatcher.on('error', () => this.createDispatcher())
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('Unable to retrieve video metadata')
            ) {
                this.queue.unshift(track)
            }

            await this.createDispatcher()
        }
    }

    private scheduleDisconnect () {
        this.disconnectTimeout = setTimeout(() => this.disconnect(), 5 * 60 * 1000)
    }
}
