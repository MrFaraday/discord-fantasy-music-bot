import {
    createAudioPlayer,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource
} from '@discordjs/voice'
import { EmbedBuilder, TextBasedChannel, VoiceChannel } from 'discord.js'
import shuffle from 'lodash.shuffle'
import { QUEUE_MAX_LENGTH } from './config'
import GuildController from './controllers/guild-controller'
import fadeOut from './easing/fade-out'
import { GuildJournal } from './journal'
import { CreateResourceError, Track } from './track'

enum PlaybackState {
    IDLE = 0,
    PLAYING = 1,
    STOPPING = 2,
    LODAING = 3
}

interface SessionConstructorParams {
    guildId: string
    binds: Binds
    prefix: string
    volume: number
}

export default class GuildSession {
    readonly guildId: string
    readonly controller: GuildController
    binds: Binds
    prefix: string
    volume: number
    queue: Track[] = []
    journal: GuildJournal

    private state: PlaybackState = PlaybackState.IDLE
    private audioPlayer: AudioPlayer | null = null
    private playingResource: AudioResource<Track> | null = null

    private disconnectTimeout: NodeJS.Timeout | null = null

    constructor ({ guildId, binds, prefix, volume }: SessionConstructorParams) {
        this.guildId = guildId
        this.volume = volume
        this.prefix = prefix
        this.binds = binds
        this.journal = new GuildJournal(guildId)

        this.controller = new GuildController(guildId)
    }

    get voiceConnection (): VoiceConnection | undefined {
        return getVoiceConnection(this.guildId)
    }

    async play (
        channel: VoiceChannel,
        tracks: Track[],
        textChannel?: TextBasedChannel
    ): Promise<void> {
        this.journal.debug('GuildSession.play'.padEnd(30, ' '), 'state bp1', this.state)

        this.queue = [...this.queue, ...tracks].slice(0, QUEUE_MAX_LENGTH)

        if (!this.voiceConnection) {
            await this.connect(channel)
        }

        this.journal.debug('GuildSession.play'.padEnd(30, ' '), 'state bp2', this.state)

        if (this.state !== PlaybackState.PLAYING) {
            await this.playNext(textChannel)
        }
    }

    async forcePlay (
        channel: VoiceChannel,
        tracks: Track[],
        textChannel?: TextBasedChannel
    ): Promise<void> {
        this.queue = shuffle(tracks.slice(0, QUEUE_MAX_LENGTH))

        this.journal.debug(
            'GuildSession.forcePlay'.padEnd(30, ' '),
            'state bp4',
            this.state
        )

        if (!this.voiceConnection) {
            await this.connect(channel)
        }

        this.journal.debug(
            'GuildSession.forcePlay'.padEnd(30, ' '),
            'state bp4',
            this.state
        )

        await this.playNext(textChannel)
    }

    async connect (channel: VoiceChannel): Promise<void> {
        if (!channel.guild) return
        if (!channel.guild.voiceAdapterCreator) return

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
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
            this.audioPlayer?.stop()
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
                    this.journal.debug('RETRYING |', error)
                    this.queue.unshift(this.playingResource?.metadata)
                } else {
                    this.journal.error('UNHANLDED audioPlayer error:', '\n', error)
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
                this.unscheduleDisconnect()
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

    get trackEmbed (): EmbedBuilder | undefined {
        if (this.playingResource) {
            return this.playingResource.metadata.getMessageEmbed()
        }
    }

    private get playerVolume () {
        return 0.005 * this.volume
    }

    private async playNext (textChannel?: TextBasedChannel) {
        if (!this.voiceConnection) return
        if (!this.audioPlayer) return
        if (this.state === PlaybackState.LODAING) return

        this.journal.debug(
            'GuildSession.playNext'.padEnd(30, ' '),
            'state bp5',
            this.state
        )

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
                track.createAudioResource(this.guildId).then((res) => {
                    res.volume?.setVolume(this.playerVolume)
                    return res
                }),
                this.stopCurrentTrack()
            ])

            this.journal.debug(
                'GuildSession.playNext'.padEnd(30, ' '),
                'state bp6',
                this.state
            )

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
            } else if (
                error instanceof CreateResourceError &&
                error.code === CreateResourceError.MAX_ATTEMPTS_EXCEEDED &&
                textChannel &&
                this.queue.length === 0
            ) {
                textChannel.send('Something get wrong, check this later').catch(() => 0)
            } else if (error instanceof CreateResourceError) {
                // next track
            } else if (
                error instanceof Error &&
                error.message.includes('Cannot play a resource that has already ended')
            ) {
                this.journal.debug('RETRYING |', error)
                this.queue.unshift(track)
            } else {
                this.journal.error(
                    'UNHANLDED playNext error:',
                    error,
                    '\n',
                    'track:',
                    JSON.stringify(track, null, 2)
                )
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

    private unscheduleDisconnect () {
        if (this.disconnectTimeout) {
            clearTimeout(this.disconnectTimeout)
            this.disconnectTimeout = null
        }
    }

    private scheduleDisconnect () {
        this.disconnectTimeout = setTimeout(() => this.disconnect(), 5 * 60 * 1000)
    }
}
