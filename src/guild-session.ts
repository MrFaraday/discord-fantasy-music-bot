import {
    createAudioPlayer,
    entersState,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
    VoiceConnectionStatus,
    AudioPlayerStatus,
    AudioResource
} from '@discordjs/voice'
import { EmbedBuilder, TextBasedChannel, VoiceChannel } from 'discord.js'
import shuffle from 'lodash.shuffle'
import { NODE_ENV, QUEUE_MAX_LENGTH } from './config'
import GuildController from './controllers/guild-controller'
import fadeOut from './easing/fade-out'
import { GuildJournal } from './journal'
import { CreateResourceError, Track } from './track'

// enum PlaybackState {
//     IDLE = 0,
//     PLAYING = 1,
//     STOPPING = 2,
//     LODAING = 3
// }

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
    bussy = false

    // private state: PlaybackState = PlaybackState.IDLE
    private audioPlayer = createAudioPlayer({
        debug: NODE_ENV === 'development',
        behaviors: { maxMissedFrames: 1000 }
    })
    private playingResource: AudioResource<Track> | null = null

    private disconnectTimeout: NodeJS.Timeout | null = null

    constructor ({ guildId, binds, prefix, volume }: SessionConstructorParams) {
        this.guildId = guildId
        this.volume = volume
        this.prefix = prefix
        this.binds = binds
        this.journal = new GuildJournal(guildId)

        this.controller = new GuildController(guildId)

        this.audioPlayer.on('error', (error) => {
            // this.state = PlaybackState.IDLE

            if (error.message === 'Status code: 403' && this.playingResource?.metadata) {
                this.journal.debug('RETRYING |', error)
                this.queue.unshift(this.playingResource?.metadata)
            } else {
                this.journal.error('UNHANDLED audioPlayer error:', '\n', error)
            }

            this.playingResource = null
            void this.playNext()
        })

        this.audioPlayer.on('debug', (message) => {
            this.journal.debug('Audio Player >', message)
        })

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.scheduleDisconnect()
            this.playingResource = null

            // if (this.state !== PlaybackState.LODAING) {
            //     this.state = PlaybackState.IDLE
            // }

            void this.playNext()
        })

        this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
            this.unscheduleDisconnect()
            // this.state = PlaybackState.PLAYING
        })
    }

    get voiceConnection (): VoiceConnection | undefined {
        return getVoiceConnection(this.guildId)
    }

    async play (
        channel: VoiceChannel,
        tracks: Track[],
        textChannel?: TextBasedChannel
    ): Promise<void> {
        // this.journal.debug('GuildSession.play'.padEnd(30, ' '), 'state bp1', this.state)

        this.queue = [...this.queue, ...tracks].slice(0, QUEUE_MAX_LENGTH)

        if (!this.voiceConnection) {
            await this.connect(channel)
        }

        // this.journal.debug('GuildSession.play'.padEnd(30, ' '), 'state bp2', this.state)

        if (this.playerStatus === AudioPlayerStatus.Idle) {
            await this.playNext(textChannel)
        }
    }

    async forcePlay (
        channel: VoiceChannel,
        tracks: Track[],
        textChannel?: TextBasedChannel
    ): Promise<void> {
        this.queue = shuffle(tracks.slice(0, QUEUE_MAX_LENGTH))

        // this.journal.debug(
        //     'GuildSession.forcePlay'.padEnd(30, ' '),
        //     'state bp4',
        //     this.state
        // )

        if (!this.voiceConnection) {
            await this.connect(channel)
        }

        // this.journal.debug(
        //     'GuildSession.forcePlay'.padEnd(30, ' '),
        //     'state bp4',
        //     this.state
        // )

        await this.playNext(textChannel)
    }

    async connect (channel: VoiceChannel): Promise<void> {
        // if (!channel.guild) return
        // if (!channel.guild.voiceAdapterCreator) return

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false
        })

        connection.subscribe(this.audioPlayer)
        this.scheduleDisconnect()

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            this.journal.debug('Voice Connection > Disconnected')

            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
                ])
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                connection.destroy()
            }
        })
        connection.on(VoiceConnectionStatus.Destroyed, () => {
            this.journal.debug('Voice Connection > Destroyed')

            this.queue = []
            this.audioPlayer.stop(true)
            this.playingResource = null
            // this.state = PlaybackState.IDLE
        })
        connection.on(VoiceConnectionStatus.Connecting, () => {
            this.journal.debug('Voice Connection > Connecting')
        })
        connection.on(VoiceConnectionStatus.Ready, () => {
            this.journal.debug('Voice Connection > Ready')
        })
        connection.on(VoiceConnectionStatus.Signalling, () => {
            this.journal.debug('Voice Connection > Signalling')
        })

        await entersState(connection, VoiceConnectionStatus.Ready, 20e3)
    }

    disconnect (): void {
        this.voiceConnection?.destroy()
    }

    changeVolume (volume: number): void {
        this.volume = volume
        this.playingResource?.volume?.setVolume(this.playerVolume)
    }

    async skip (): Promise<void> {
        await this.playNext()
    }

    async stop (): Promise<void> {
        this.queue = []
        await this.skip()
        this.audioPlayer.stop(true)
    }

    get isPlaying (): boolean {
        // return this.state !== PlaybackState.IDLE
        return this.audioPlayer.state.status === AudioPlayerStatus.Playing
    }
    get playerStatus () {
        return this.audioPlayer.state.status
    }

    get trackEmbed (): EmbedBuilder | undefined {
        if (this.playingResource) {
            return this.playingResource.metadata.getMessageEmbed()
        }
    }

    get currentTrack (): Track | undefined {
        if (this.playingResource) {
            return this.playingResource.metadata
        }
    }

    private get playerVolume () {
        return 0.005 * this.volume
    }

    private async playNext (textChannel?: TextBasedChannel) {
        if (this.bussy) {
            return
        }
        this.bussy = true
        console.log('CALL playNext')

        // if (!this.voiceConnection) return

        // if (this.state === PlaybackState.LODAING) return

        // this.journal.debug(
        //     'GuildSession.playNext'.padEnd(30, ' '),
        //     'state bp5',
        //     this.state
        // )

        const track = this.queue.shift()

        console.log(track)
        console.log(this.isPlaying)
        console.log()

        if (!track && this.isPlaying) {
            // this.state = PlaybackState.STOPPING
            /* const stopped = */ await this.stopCurrentTrack()

            // if (!stopped) {
            //     this.state = PlaybackState.IDLE
            // }
            this.bussy = false
            return
        } else if (!track) {
            this.bussy = false
            return
        }

        try {
            // this.state = PlaybackState.LODAING

            console.log('loading resource')

            const [resource] = await Promise.all([
                track.createAudioResource(this.guildId).then((res) => {
                    res.volume?.setVolume(this.playerVolume)
                    console.log('resource loaded ')
                    return res
                }),
                this.stopCurrentTrack()
            ])

            console.log('ready')

            // this.journal.debug(
            //     'GuildSession.playNext'.padEnd(30, ' '),
            //     'state bp6',
            //     this.state
            // )

            this.playingResource = resource
            this.audioPlayer.play(resource)
        } catch (error) {
            console.log('playNext', error)

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
                    'UNHANDLED playNext error:',
                    error,
                    '\n',
                    'track:',
                    JSON.stringify(track, null, 2)
                )
            }

            // this.state = PlaybackState.IDLE
            this.bussy = false
            await this.playNext()
        } finally {
            this.bussy = false
        }
    }

    private async stopCurrentTrack () {
        if (this.playingResource) {
            await fadeOut(this.audioPlayer, this.playingResource).catch((e) =>
                console.log('stopCurrentTrack', e)
            )
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
