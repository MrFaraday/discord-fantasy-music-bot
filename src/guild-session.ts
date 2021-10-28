import {
    createAudioPlayer,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
    AudioPlayer,
    AudioPlayerStatus,
    DiscordGatewayAdapterCreator,
    AudioResource
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

enum SessionState {
    IDLE,
    PENDING,
    PLAYING
}

export default class GuildSession {
    readonly guild: Guild
    slots: Slots
    prefix: string
    volume: number
    queue: Track[] = []

    private audioPlayer: AudioPlayer | null = null
    private playingResource: AudioResource<Track> | null = null

    private disconnectTimeout: NodeJS.Timeout | null = null

    private isRepeatLocked = false
    private terminationPromise: Promise<void> | null = null

    private state: SessionState = SessionState.IDLE

    constructor ({ guild, slots, prefix, volume }: SessionConstructorParams) {
        this.guild = guild
        this.volume = volume
        this.prefix = prefix
        this.slots = slots
    }

    get voiceConnection (): VoiceConnection | undefined {
        return getVoiceConnection(this.guild.id)
    }

    async play (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        this.queue = [...this.queue, ...tracks].slice(0, MAX_QUEUE_LENGTH)

        if (!this.voiceConnection) {
            await this.connect(channel)
        }

        await this.playNext()
    }

    async forcePlay (channel: VoiceChannel, tracks: Track[]): Promise<void> {
        this.queue = shuffle(tracks).slice(0, MAX_QUEUE_LENGTH)

        if (!this.voiceConnection) {
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
            adapterCreator: channel.guild
                .voiceAdapterCreator as DiscordGatewayAdapterCreator
        })

        connection.removeAllListeners()
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 2_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 2_000)
                ])
            } catch (error) {
                this.disconnect()
            }
        })

        if (!this.audioPlayer) {
            this.audioPlayer = createAudioPlayer()
            this.audioPlayer.on('error', (err) => {
                console.error('Dispatcher error:', err)
                console.warn(Object.keys(err))

                this.onDispatcherFinish()
            })

            this.audioPlayer.on(AudioPlayerStatus.Idle, () => this.onDispatcherFinish())
            this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
                if (this.playingResource) {
                    void this.playingResource.metadata.onStart()
                }
            })

            await entersState(connection, VoiceConnectionStatus.Ready, 20e3)
            connection.subscribe(this.audioPlayer)
        }
    }

    disconnect (): void {
        this.voiceConnection?.destroy()
        this.queue = []
        this.audioPlayer = null
        this.playingResource = null
    }

    changeVolume (volume: number): void {
        this.volume = volume
        this.playingResource?.volume?.setVolume(this.playerVolume)
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

    private get playerVolume () {
        return 0.005 * this.volume
    }

    private async playNext ({ endCurrent = false } = {}) {
        if (!this.voiceConnection) return
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
            this.playingResource = resource
            resource.volume?.setVolume(this.playerVolume)

            // resource.volume?.setVolume(this.dispatcherVolume)
            // resource.

            // await this.terminationPromise
            this.isRepeatLocked = false

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
        if (this.audioPlayer && this.playingResource) {
            // return Promise.resolve()
            await fadeOut(this.audioPlayer, this.playingResource)
            // await new Promise((res) => {
            //     if (!this.playingTrack) {
            //         res(void 0)
            //     } else {
            //         this.playingTrack.end(() => {
            //             this.dispatcher = null
            //             res(void 0)
            //         })
            //     }
            // })
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
