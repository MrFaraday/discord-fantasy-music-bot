const { Guild, VoiceChannel, VoiceConnection, StreamDispatcher } = require('discord.js')

const ytdl = require('ytdl-core') // youtube downloader
const ShuffleableArray = require('./ShuffleableArray')
const { fadeOut } = require('../libs/effects') // Effects

const BASE_VOLUME = 0.12 // Default volume

/**
 * Guild connection instance
 */
module.exports = class GuildConnection {
    /**
     * @param { Guild } guild
     */
    constructor(guild) {
        /**
         * @private
         * @type { ShuffleableArray }
         */
        this._queue = new ShuffleableArray()

        /**
         * @private
         * @type { Guild }
         */
        this._guild = guild // Link to instance of Discord Guild

        /**
         * @private
         * @type { number }
         */
        this._volume = BASE_VOLUME

        /**
         * @private
         * @type { VoiceConnection }
         */
        this._connection

        /**
         * @private
         * @type { StreamDispatcher }
         */
        this._dispatcher
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
            this._newVoiceConnection(channel)
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
        await this._newQueue() // Очистка очереди
        for (const track of tracks) this._queue.push(track.url) // Создание новой очереди

        this._queue.shuffle() // Shuffling

        if (!this._connection) {
            this._newVoiceConnection(channel)
        } else if (this._dispatcher) {
            fadeOut(this._dispatcher)
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

        this._connection.on('disconnect', async () => {
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
        this._dispatcher = this._connection.play(ytdl(this._queue[0], { filter: 'audioonly' }), {
            volume: this._volume
        })

        this._queue.shift()

        // End of track
        this._dispatcher.on('end', async () => {
            if (this._queue[0]) {
                this._newDispatcher()
            } else {
                this._dispatcher = null
            }
        })

        this._dispatcher.on('finish', async () => {
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
    async volumeChange(volume) {
        this._volume = (BASE_VOLUME / 5) * volume
        this._dispatcher.setVolume(this._volume)
    }

    /**
     * Skipping
     * @public
     */
    skip() {
        if (!this._dispatcher) return 0
        fadeOut(this._dispatcher)

        return 1
    }

    /**
     * Stopping
     * @public
     */
    stop() {
        if (!this._dispatcher) return 0
        this._newQueue()
        fadeOut(this._dispatcher)

        return 1
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
