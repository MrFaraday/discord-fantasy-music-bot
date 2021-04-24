import { Guild, VoiceChannel, VoiceConnection } from 'discord.js'
import shuffle from 'lodash.shuffle'
import { MAX_QUEUE_LENGTH } from './config'
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
    queue: Track[] = []

    private connection: VoiceConnection | null = null
    private disconnectTimeout: NodeJS.Timeout | null = null

    constructor ({ guild, slots, prefix, volume }: SessionConstructorParams) {
        this.guild = guild
        this.volume = volume
        this.prefix = prefix
        this.slots = slots
    }

    async play (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        this.queue = [...this.queue, ...tracks].slice(0, MAX_QUEUE_LENGTH)

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

    async switchChannel (channel: VoiceChannel): Promise<boolean> {
        if (this.connection) {
            this.connection = await channel.join()
            this.registerConnectionListeners()
            return true
        } else {
            return false
        }
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

    get channel (): VoiceChannel | null {
        return this.connection?.channel ?? null
    }

    private get dispatcher () {
        return this.connection?.dispatcher
    }
    private get dispatcherVolume () {
        return 0.005 * this.volume
    }

    /**
     * Connecting to a voice channel
     */
    private async connect (channel: VoiceChannel) {
        this.connection = await channel.join()
        this.registerConnectionListeners()
        await this.connection.voice?.setSelfDeaf(true)
        await this.createDispatcher()
    }

    /**
     * Creating dispatcher and event listeners
     */
    private async createDispatcher () {
        if (!this.connection) return

        const track = this.queue.shift()

        if (!track) {
            this.scheduleDisconnect()
            return
        }

        try {
            const stream = await track.getStream()

            const dispatcher = this.connection.play(stream, {
                volume: this.dispatcherVolume,
                type: 'opus'
            })

            if (this.disconnectTimeout) {
                clearTimeout(this.disconnectTimeout)
            }

            const next = () => void this.createDispatcher()

            // End of track
            dispatcher.on('end', next)
            dispatcher.on('finish', next)
            dispatcher.on('error', next)
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('Unable to retrieve video metadata')
            ) {
                this.queue.unshift(track)
            }

            console.warn('createDispatcher:', error)

            await this.createDispatcher()
        }
    }

    private registerConnectionListeners () {
        this.connection?.on('disconnect', () => {
            this.queue = []
            this.connection = null

            if (this.dispatcher) {
                this.dispatcher.end()
            }
        })
    }

    private scheduleDisconnect () {
        this.disconnectTimeout = setTimeout(() => this.disconnect(), 5 * 60 * 1000)
    }
}
