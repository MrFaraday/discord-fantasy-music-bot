const shuffle = require('lodash.shuffle')
const fadeOut = require('./easing/fade-out')
const defaultSlots = require('./config/default-slots.config.json')

const defaultVolume = 0.12

module.exports = class GuildConnection {
    /**
     * @param { import('discord.js').Guild } guild
     */
    constructor (guild) {
        this._guild = guild // Link to instance of Discord Guild

        /**
         * @type { Track[] }
         */
        this._queue = []
        this._volume = defaultVolume
        this.prefix = ''

        this.slots = new Map()
        defaultSlots.forEach((slot) => {
            this.slots.set(slot.slot, { name: slot.name, value: slot.value })
        })
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
        this._volume = (defaultVolume / 5) * volume
        this._dispatcher.setVolume(this._volume)
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
            this._dispatcher = null
            return
        }

        try {
            const stream = await track.getStream()

            this._dispatcher = this._connection.play(stream, { volume: this._volume, type: 'opus' })

            // End of track
            this._dispatcher.on('end', () => this._newDispatcher())
            this._dispatcher.on('finish', () => this._newDispatcher())

            this._dispatcher.on('error', (err) => {
                console.warn('Playing item:', track.title)
                console.warn(err.message)

                this._newDispatcher()
            })
        } catch (error) {
            console.warn('Playing item:', track.title)
            console.warn(error.message, '\n')

            if (error.message.includes('Unable to retrieve video metadata')) {
                this._queue.unshift(track)
            }

            this._newDispatcher()
        }
    }
}
