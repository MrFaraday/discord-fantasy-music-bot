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
import PlayingStateMixin, { PlaybackState } from './playing-state-mixin'
import { Track } from './track'

interface SessionConstructorParams {
    guild: Guild
    slots: Slots
    prefix: string
    volume: number
}

export default class GuildSession extends PlayingStateMixin {
    readonly guild: Guild
    slots: Slots
    prefix: string
    volume: number
    queue: Track[] = []

    private audioPlayer: AudioPlayer | null = null
    private playingResource: AudioResource<Track> | null = null

    private disconnectTimeout: NodeJS.Timeout | null = null

    constructor ({ guild, slots, prefix, volume }: SessionConstructorParams) {
        super()

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
        this.queue = []        
        await this.play(channel, shuffle(tracks))
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
                console.error('audioPlayer | ERROR:', err)
                console.warn(Object.keys(err))

                this.state = PlaybackState.IDLE

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
                this.deleteScheduleDisconnect()
                this.state = PlaybackState.PLAYING

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
            await this.playNext()
        }
    }

    async stop (): Promise<void> {
        this.queue = []
        await this.skip()
    }

    isPlaying (): boolean {
        return !!this.playingResource
    }

    private get playerVolume () {
        return 0.005 * this.volume
    }

    private async playNext () {
        if (!this.voiceConnection) return
        if (!this.audioPlayer) return
        if (this.state === PlaybackState.LODAING) return

        const track = this.queue.shift()

        if (!track) {
            this.state = PlaybackState.STOPPING
            return void this.stopCurrentTrack()
        }

        try {
            this.state = PlaybackState.LODAING

            const [resource] = await Promise.all([
                track.createAudioResource(),
                this.stopCurrentTrack()
            ])

            this.playingResource = resource
            resource.volume?.setVolume(this.playerVolume)
            this.audioPlayer.play(resource)
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('Unable to retrieve video metadata')
            ) {
                console.warn('Unable to retrieve video metadata | RETRYING');
                this.queue.unshift(track)
            }

            console.warn('playNext | ERROR:', error)

            this.state = PlaybackState.IDLE
            await this.playNext()
        }
    }

    private async stopCurrentTrack () {
        if (this.audioPlayer && this.playingResource) {
            await fadeOut(this.audioPlayer, this.playingResource)
        }
    }

    private deleteScheduleDisconnect () {
        if (this.disconnectTimeout) {
            clearTimeout(this.disconnectTimeout)
            this.disconnectTimeout = null
        }
    }

    private scheduleDisconnect () {
        this.disconnectTimeout = setTimeout(() => this.disconnect(), 5 * 60 * 1000)
    }
}
