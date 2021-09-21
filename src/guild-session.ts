import {
    createAudioPlayer,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
    AudioPlayer,
    AudioPlayerStatus,
    demuxProbe,
    createAudioResource,
    AudioResource
} from '@discordjs/voice'
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

    // private connection: VoiceConnection | null = null
    // private dispatcher: StreamDispatcher | null = null
    private audioPlayer: AudioPlayer | null = null
    private disconnectTimeout: NodeJS.Timeout | null = null

    private isRepeatLocked = false
    private terminationPromise: Promise<void> | null = null

    constructor ({ guild, slots, prefix, volume }: SessionConstructorParams) {
        this.guild = guild
        this.volume = volume
        this.prefix = prefix
        this.slots = slots
    }

    get connection (): VoiceConnection | undefined {
        return getVoiceConnection(this.guild.id)
    }

    async play (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        this.queue = [...this.queue, ...tracks].slice(0, MAX_QUEUE_LENGTH)

        if (!this.connection) {
            await this.connect(channel)
            await this.createPlayer()
        } else if (!this.audioPlayer) {
            await this.createPlayer()
        }
    }

    async forcePlay (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        this.queue = shuffle(tracks)

        if (!this.connection) {
            await this.connect(channel)
            await this.createPlayer()
        } else {
            await this.createPlayer({ endCurrent: true })
        }
    }

    async connect (channel: VoiceChannel): Promise<void> {
        if (!channel.guild) return
        if (!channel.guild.voiceAdapterCreator) return

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        })

        await this.guild.me?.voice.setDeaf(true)

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
                ])
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                this.queue = []
                connection.destroy()
                void this.requestDispatcherTermination()
            }
        })
    }

    disconnect (): void {
        this.connection?.disconnect()
    }

    changeVolume (volume: number): void {
        this.volume = volume
        // this.dispatcher?.setVolume(this.dispatcherVolume)
    }

    async skip (): Promise<void> {
        if (this.audioPlayer) {
            await this.createPlayer({ endCurrent: true })
        }
    }

    async stop (): Promise<void> {
        this.queue = []
        await this.skip()
    }

    isPlaying (): boolean {
        return !!this.audioPlayer
    }

    get channel (): VoiceChannel | null {
        return /* this.connection?.channel ?? */ null
    }

    private get dispatcherVolume () {
        return 0.005 * this.volume
    }

    private async createPlayer ({ endCurrent = false } = {}) {
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

            const stream: any = await track.getStream()
            const resource = await probeAndCreateResource(stream)

            resource.volume?.setVolume(this.dispatcherVolume)
            // resource.

            await this.terminationPromise
            this.isRepeatLocked = false

            this.audioPlayer = createAudioPlayer()

            this.audioPlayer.on('error', (err) => {
                console.error('Dispatcher error:', err)
                this.onDispatcherFinish()
            })

            this.audioPlayer.on(AudioPlayerStatus.Idle, () => this.onDispatcherFinish())

            this.audioPlayer.play(stream)

            /* this.dispatcher = this.connection.play(stream, {
                volume: this.dispatcherVolume,
                type: 'opus',
                bitrate: 96
            }) */

            this.cancelScheduleDisconnect()
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('Unable to retrieve video metadata')
            ) {
                this.queue.unshift(track)
            }

            console.warn('createDispatcher:', error)

            await this.createPlayer()
        }
    }

    private onDispatcherFinish () {
        this.scheduleDisconnect()

        if (!this.isRepeatLocked) {
            this.audioPlayer = null
            void this.createPlayer()
        }
    }

    private async requestDispatcherTermination () {
        await (this.terminationPromise = this.terminateAudioPlayer())
    }
    private async terminateAudioPlayer () {
        if (this.audioPlayer) {
            return Promise.resolve()
            /* await fadeOut(this.dispatcher)
            await new Promise((res) => {
                if (!this.dispatcher) {
                    res(void 0)
                } else {
                    this.dispatcher.end(() => {
                        this.dispatcher = null
                        res(void 0)
                    })
                }
            }) */
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

async function probeAndCreateResource (readableStream: Stream): Promise<AudioResource> {
    const { stream, type } = await demuxProbe(readableStream)
    return createAudioResource(stream, { inputType: type, inlineVolume: true })
}
