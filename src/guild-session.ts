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
import { Guild, MessageEmbed, TextBasedChannels, VoiceChannel } from 'discord.js'
import shuffle from 'lodash.shuffle'
import { QUEUE_MAX_LENGTH } from './config'
import fadeOut from './easing/fade-out'
import { CreateResourceError, Track } from './track'

enum PlaybackState {
    IDLE = 0,
    PLAYING = 1,
    STOPPING = 2,
    LODAING = 3
}

interface SessionConstructorParams {
    guild: Guild
    binds: Binds
    prefix: string
    volume: number
}

export default class GuildSession {
    readonly guild: Guild
    binds: Binds
    prefix: string
    volume: number
    queue: Track[] = []

    private state: PlaybackState = PlaybackState.IDLE
    private audioPlayer: AudioPlayer | null = null
    private playingResource: AudioResource<Track> | null = null

    private disconnectTimeout: NodeJS.Timeout | null = null

    constructor ({ guild, binds, prefix, volume }: SessionConstructorParams) {
        this.guild = guild
        this.volume = volume
        this.prefix = prefix
        this.binds = binds
    }

    get voiceConnection (): VoiceConnection | undefined {
        return getVoiceConnection(this.guild.id)
    }

    async play (
        channel: VoiceChannel,
        tracks: Track[],
        textChannel?: TextBasedChannels
    ): Promise<void> {
        this.queue = [...this.queue, ...tracks].slice(0, QUEUE_MAX_LENGTH)

        if (!this.voiceConnection) {
            await this.connect(channel)
        }

        if (this.state !== PlaybackState.PLAYING) {
            await this.playNext(textChannel)
        }
    }

    async forcePlay (
        channel: VoiceChannel,
        tracks: Track[],
        textChannel?: TextBasedChannels
    ): Promise<void> {
        this.queue = shuffle(tracks.slice(0, QUEUE_MAX_LENGTH))

        if (!this.voiceConnection) {
            await this.connect(channel)
        }

        await this.playNext(textChannel)
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
        connection.on(VoiceConnectionStatus.Destroyed, () => {
            this.queue = []
            this.audioPlayer = null
            this.playingResource = null
            this.state = PlaybackState.IDLE
        })

        if (!this.audioPlayer) {
            this.audioPlayer = createAudioPlayer()

            /**
             * @todo catch `abort` error
             */
            this.audioPlayer.on('error', (error) => {
                this.state = PlaybackState.IDLE

                if (
                    error.message === 'Status code: 403' &&
                    this.playingResource?.metadata
                ) {
                    console.log('>> RETRYING |', error.message)
                    this.queue.unshift(this.playingResource?.metadata)
                } else {
                    console.error('>> UNHANLDED audioPlayer error')
                    console.error(error.message)
                    console.error('>> NAME')
                    console.error(error.name)
                    console.error('>> RESOURCE')
                    console.error(error.resource)
                    console.error('<< END')
                }

                this.playingResource = null
                void this.playNext()
            })

            this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
                this.scheduleDisconnect()
                this.playingResource = null

                if (this.state !== PlaybackState.LODAING) {
                    this.state = PlaybackState.IDLE
                }

                void this.playNext()
            })
            this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
                this.unscheduleSDisconnect()
                this.state = PlaybackState.PLAYING
            })

            await entersState(connection, VoiceConnectionStatus.Ready, 20e3)
            connection.subscribe(this.audioPlayer)
        }
    }

    disconnect (): void {
        this.voiceConnection?.destroy()
    }

    changeVolume (volume: number): void {
        this.volume = volume
        this.playingResource?.volume?.setVolume(this.playerVolume)
    }

    async skip (): Promise<void> {
        if (this.audioPlayer) {
            await this.playNext()
        }
    }

    async stop (): Promise<void> {
        this.queue = []
        await this.skip()
    }

    get isPlaying (): boolean {
        return this.state !== PlaybackState.IDLE
    }

    get trackEmbed (): MessageEmbed | undefined {
        if (this.playingResource) {
            return this.playingResource.metadata.getMessageEmbed()
        }
    }

    private get playerVolume () {
        return 0.005 * this.volume
    }

    private async playNext (textChannel?: TextBasedChannels) {
        if (!this.voiceConnection) return
        if (!this.audioPlayer) return
        if (this.state === PlaybackState.LODAING) return

        const track = this.queue.shift()

        if (!track && this.state === PlaybackState.PLAYING) {
            this.state = PlaybackState.STOPPING
            const stopped = await this.stopCurrentTrack()

            if (!stopped) {
                this.state = PlaybackState.IDLE
            }

            return
        } else if (!track) {
            return
        }

        try {
            this.state = PlaybackState.LODAING

            const [resource] = await Promise.all([
                track.createAudioResource().then((res) => {
                    res.volume?.setVolume(this.playerVolume)
                    return res
                }),
                this.stopCurrentTrack()
            ])

            this.playingResource = resource
            this.audioPlayer.play(resource)
        } catch (error) {
            if (
                error instanceof CreateResourceError &&
                error.code === CreateResourceError.RESTRICTED &&
                textChannel &&
                this.queue.length === 0
            ) {
                textChannel.send('I can\'t play it, sory').catch(() => 0)
            } else if (error instanceof CreateResourceError) {
                // next track
            } else if (
                error instanceof Error &&
                error.message.includes('Cannot play a resource that has already ended')
            ) {
                console.log('>> RETRYING |', error.message)
                this.queue.unshift(track)
            } else {
                console.error('>> UNHANDLED playNext error')
                console.error(track)
                console.error(error)
            }

            this.state = PlaybackState.IDLE
            await this.playNext()
        }
    }

    private async stopCurrentTrack () {
        if (this.audioPlayer && this.playingResource) {
            await fadeOut(this.audioPlayer, this.playingResource)
            return true
        } else {
            return false
        }
    }

    private unscheduleSDisconnect () {
        if (this.disconnectTimeout) {
            clearTimeout(this.disconnectTimeout)
            this.disconnectTimeout = null
        }
    }

    private scheduleDisconnect () {
        this.disconnectTimeout = setTimeout(() => this.disconnect(), 5 * 60 * 1000)
    }
}
