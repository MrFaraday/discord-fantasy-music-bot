const shuffle = require('lodash.shuffle')
const fadeOut = require('./easing/fade-out')

module.exports = class GuildSession {
    /**
     * @param { Object } p
     * @param { import('discord.js').Client } p.app
     * @param { import('discord.js').Guild } p.guild
     * @param { Slots } p.slots
     * @param { string } p.prefix
     * @param { number } p.volume
     */
    constructor ({ app, guild, slots, prefix, volume }) {
        this._app = app
        this._guild = guild

        /**
         * @type { Track[] }
         */
        this._queue = []
        this.volume = volume
        this.prefix = prefix
        this.slots = slots
    }

    /**
     * Playing music
     * @param { import('discord.js').VoiceChannel } channel
     * @param { Track[] } tracks
     */
    async play (channel, tracks) {
        tracks.forEach((track) => this._queue.push(track))

        if (!this._connection) {
            await this._newVoiceConnection(channel)
        } else if (!this._dispatcher) {
            await this._newDispatcher()
        }
    }

    /**
     * Force playing
     * @param { import('discord.js').VoiceChannel } channel
     * @param { Track[] } tracks
     */
    async forcePlay (channel, tracks) {
        this._queue = shuffle(tracks)

        if (!this._connection) {
            await this._newVoiceConnection(channel)
        } else if (this._dispatcher) {
            fadeOut(this._dispatcher)
        } else {
            this._newDispatcher()
        }
    }

    /**
     * Volume changing
     * @param { number } volume
     */
    changeVolume (volume) {
        this.volume = volume

        if (this._dispatcher) {
            this._dispatcher.setVolume(this._dispatcherVolume)
        }
    }

    /**
     * Skipping
     */
    skip () {
        if (!this._dispatcher) return

        fadeOut(this._dispatcher)
    }

    /**
     * Stopping
     */
    stop () {
        if (!this._dispatcher) return
        this._queue = []
        fadeOut(this._dispatcher)
    }

    /**
     * Checking playing status
     */
    isPlaying () {
        return !!this._dispatcher
    }

    disconnect () {
        this._queue = []

        if (this._dispatcher) {
            this._dispatcher.end()
        }

        if (this._connection) {
            this._connection.disconnect()
        }
    }

    get _dispatcherVolume () {
        const v = 0.005 * this.volume
        return v
    }

    /**
     * Creating connection to voice channel
     * @param { import('discord.js').VoiceChannel } channel
     */
    async _newVoiceConnection (channel) {
        this._connection = await channel.join()
        this._newDispatcher()

        this._connection.on('disconnect', () => {
            this._queue = []
            this._connection = null
            if (this._dispatcher) this._dispatcher.end()
        })
    }

    /**
     * Creating dispatcher and event listeners
     */
    async _newDispatcher () {
        const track = this._queue.shift()

        if (!track) {
            this._scheduleDisconnect()
            this._dispatcher = null
            return
        }

        try {
            const stream = await track.getStream()

            this._dispatcher = this._connection.play(stream, {
                volume: this._dispatcherVolume,
                type: 'opus'
            })

            clearTimeout(this._disconnectTimeout)

            // End of track
            this._dispatcher.on('end', () => this._newDispatcher())
            this._dispatcher.on('finish', () => this._newDispatcher())

            this._dispatcher.on('error', () => this._newDispatcher())
        } catch (error) {
            if (error.message.includes('Unable to retrieve video metadata')) {
                this._queue.unshift(track)
            }

            this._newDispatcher()
        }
    }

    _scheduleDisconnect () {
        this._disconnectTimeout = setTimeout(() => this.disconnect(), 5 * 60 * 1000)
    }
}
