import {
    createAudioPlayer,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
    AudioPlayer,
    AudioPlayerStatus
} from '@discordjs/voice'
import { Guild, VoiceChannel } from 'discord.js'
import shuffle from 'lodash.shuffle'
import { MAX_QUEUE_LENGTH } from './config'
import fadeOut from './easing/fade-out'
import { Track } from './track'

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
        }

        await this.playNext()
    }

    async forcePlay (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        this.queue = shuffle(tracks)

        if (!this.connection) {
            await this.connect(channel)
            await this.playNext()
        } else {
            await this.playNext({ endCurrent: true })
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
        await entersState(connection, VoiceConnectionStatus.Ready, 20e3)

        this.audioPlayer = createAudioPlayer()

        // await this.guild.me?.voice.setDeaf(false).catch(() => 0)
        await this.guild.me?.voice.setDeaf(false).catch(console.warn)

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
                this.disconnect()
                void this.requestDispatcherTermination()
            }
        })

        connection.subscribe(this.audioPlayer)
    }

    disconnect (): void {
        this.connection?.destroy()
    }

    changeVolume (volume: number): void {
        this.volume = volume
        // this.dispatcher?.setVolume(this.dispatcherVolume)
    }

    async skip (): Promise<void> {
        if (this.audioPlayer) {
            await this.playNext({ endCurrent: true })
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

    private get playerVolume () {
        return 0.005 * this.volume
    }

    private async playNext ({ endCurrent = false } = {}) {
        if (!this.connection) return
        if (!this.audioPlayer) return

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

            const resource = await track.createAudioResource()

            console.log(resource.volume?.volume)

            resource.volume?.setVolume(this.playerVolume)

            console.log('resource created')

            // resource.volume?.setVolume(this.dispatcherVolume)
            // resource.

            // await this.terminationPromise
            this.isRepeatLocked = false

            this.audioPlayer.on('error', (err) => {
                console.error('Dispatcher error:', err)
                this.onDispatcherFinish()
            })

            this.audioPlayer.on(AudioPlayerStatus.Idle, () => this.onDispatcherFinish())
            this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
                void track.onStart()
            })

            console.log('before start playing')
            this.audioPlayer.play(resource)

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

            await this.playNext()
        }
    }

    private onDispatcherFinish () {
        this.scheduleDisconnect()

        if (!this.isRepeatLocked) {
            this.audioPlayer = null
            void this.playNext()
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
