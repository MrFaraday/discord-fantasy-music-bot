const { Guild, VoiceChannel, VoiceConnection, StreamDispatcher } = require('discord.js')

const ytdl = require('ytdl-core-discord') // youtube downloader
const ShuffleableArray = require('./ShuffleableArray')
const Effects = require('../libs/effects')

const BASE_VOLUME = 0.12 // Default volume

module.exports = class GuildConnection {
    /**
     * @private
     * @type { ShuffleableArray }
     */
    _queue = new ShuffleableArray()

    /**
     * @private
     * @type { number }
     */
    _volume = BASE_VOLUME

    /**
     * @private
     * @type { VoiceConnection }
     */
    _connection

    /**
     * @private
     * @type { StreamDispatcher }
     */
    _dispatcher

    /**
     * @param { Guild } guild
     */
    constructor(guild) {
        /**
         * @private
         * @type { Guild }
         */
        this._guild = guild // Link to instance of Discord Guild

        /**
         * @private
         */
        this._effects = new Effects()
    }

    /**
     * Playing music
     * @public
     * @param { VoiceChannel } channel
     * @param { string } track
     */
    async play(channel, track) {
        this._queue.push(track) // Add to queue

        if (!this._connection) {
            await this._newVoiceConnection(channel)
        } else if (!this._dispatcher) {
            this._newDispatcher()
        }
    }

    /**
     * Force playing
     * @public
     * @param { VoiceChannel } channel
     * @param { import('../types').Track[] } tracks
     */
    async forcePlay(channel, tracks) {
        if (tracks.length === 0) {
            throw new Error('empty')
        }

        this._newQueue()

        tracks.forEach((track) => this._queue.push(track.url))

        this._queue.shuffle()

        if (!this._connection) {
            await this._newVoiceConnection(channel)
        } else if (this._dispatcher) {
            this._effects.fadeOut(this._dispatcher)
        } else {
            this._newDispatcher()
        }
    }

    /**
     * Creating connection to voice channel
     * @private
     * @param { VoiceChannel } channel
     */
    async _newVoiceConnection(channel) {
        this._connection = await channel.join()
        this._newDispatcher()

        this._connection.on('disconnect', () => {
            this._newQueue()
            this._connection = null
            if (this._dispatcher) this._dispatcher.end()
        })
    }

    /**
     * Creating dispatcher and event listeners
     * @private
     */
    async _newDispatcher() {
        const stream = await ytdl(this._queue[0])
        this._dispatcher = this._connection.play(stream, { volume: this._volume, type: 'opus' })

        this._queue.shift()

        // End of track
        this._dispatcher.on('end', () => {
            if (this._queue[0]) {
                this._newDispatcher()
            } else {
                this._dispatcher = null
            }
        })

        this._dispatcher.on('finish', () => {
            if (this._queue[0]) {
                this._newDispatcher()
            } else {
                this._dispatcher = null
            }
        })
    }

    /**
     * Volume changing
     * @public
     * @param { number } volume
     */
    volumeChange(volume) {
        this._volume = (BASE_VOLUME / 5) * volume
        this._dispatcher.setVolume(this._volume)
    }

    /**
     * Skipping
     * @public
     */
    skip() {
        if (!this._dispatcher) return

        this._effects.fadeOut(this._dispatcher)
    }

    /**
     * Stopping
     * @public
     */
    stop() {
        if (!this._dispatcher) return
        this._newQueue()
        this._effects.fadeOut(this._dispatcher)
    }

    /**
     * Queue clearing
     * @private
     */
    _newQueue() {
        this._queue = new ShuffleableArray()
    }

    /**
     * Checking playing status
     * @returns { boolean }
     */
    isPlaying() {
        return !!this._dispatcher
    }
}
