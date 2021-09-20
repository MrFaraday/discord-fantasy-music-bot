import { joinVoiceChannel } from '@discordjs/voice'
import { Guild, VoiceChannel } from 'discord.js'
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
    private dispatcher: StreamDispatcher | null = null
    private disconnectTimeout: NodeJS.Timeout | null = null

    private isRepeatLocked = false
    private terminationPromise: Promise<void> | null = null

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
            await this.createDispatcher()
        } else if (!this.dispatcher) {
            await this.createDispatcher()
        }
    }

    async forcePlay (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        this.queue = shuffle(tracks)

        if (!this.connection) {
            await this.connect(channel)
            await this.createDispatcher()
        } else {
            await this.createDispatcher({ endCurrent: true })
        }
    }

    async connect (channel: VoiceChannel): Promise<void> {
        if (!channel.guild) return
        if (!channel.guild.voiceAdapterCreator) return

        this.connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        })

        await this.connection?.voice?.setSelfDeaf(true)
        this.connection?.on('disconnect', () => {
            this.queue = []
            this.connection = null
            void this.requestDispatcherTermination()
        })
    }

    disconnect (): void {
        this.connection?.disconnect()
    }

    changeVolume (volume: number): void {
        this.volume = volume
        this.dispatcher?.setVolume(this.dispatcherVolume)
    }

    async skip (): Promise<void> {
        if (this.dispatcher) {
            await this.createDispatcher({ endCurrent: true })
        }
    }

    async stop (): Promise<void> {
        this.queue = []
        await this.skip()
    }

    isPlaying (): boolean {
        return !!this.dispatcher
    }

    get channel (): VoiceChannel | null {
        return this.connection?.channel ?? null
    }

    private get dispatcherVolume () {
        return 0.005 * this.volume
    }

    private async createDispatcher ({ endCurrent = false } = {}) {
        if (!this.connection) return

        const track = this.queue.shift()

        if (!track) {
            if (endCurrent) await this.requestDispatcherTermination()

            return
        }

        try {
            if (endCurrent) {
                this.isRepeatLocked = true
                void this.requestDispatcherTermination()
            }

            const stream = await track.getStream()

            await this.terminationPromise
            this.isRepeatLocked = false

            this.dispatcher = this.connection
                .play(stream, {
                    volume: this.dispatcherVolume,
                    type: 'opus',
                    bitrate: 96
                })
                .on('finish', () => this.onDispatcherFinish())
                .on('error', (err) => {
                    console.error('Dispatcher error:', err)
                    this.onDispatcherFinish()
                })

            this.cancelScheduleDisconnect()
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

    private onDispatcherFinish () {
        this.scheduleDisconnect()

        if (!this.isRepeatLocked) {
            this.dispatcher = null
            void this.createDispatcher()
        }
    }

    private async requestDispatcherTermination () {
        await (this.terminationPromise = this.terminateDispatcher())
    }
    private async terminateDispatcher () {
        if (this.dispatcher) {
            await fadeOut(this.dispatcher)
            await new Promise((res) => {
                if (!this.dispatcher) {
                    res(void 0)
                } else {
                    this.dispatcher.end(() => {
                        this.dispatcher = null
                        res(void 0)
                    })
                }
            })
        }
    }

    private cancelScheduleDisconnect () {
        if (this.disconnectTimeout) {
            clearTimeout(this.disconnectTimeout)
            this.disconnectTimeout = null
        }
    }

    private scheduleDisconnect () {
        this.disconnectTimeout = setTimeout(() => this.disconnect(), 5 * 60 * 1000)
    }
}
