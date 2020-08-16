const { Guild, VoiceChannel } = require('discord.js')

const ytdl = require('ytdl-core') // youtube downloader
const ShuffleableArray = require('./ShuffleableArray')
const { fadeOut } = require('../libs/effects') // Effects

const BASE_VOLUME = 0.12 // Default volume

/**
 * Guild connection instance
 * @type { import('../type').GuildConnection }
 */
module.exports = class GuildConnection {
    /**
     * @param { Guild } guild
     */
    constructor(guild) {
        this.newQueue() // Creating new queue

        /** @private */
        this.guild = guild // Link to instance of Discord Guild
        this.volume = BASE_VOLUME
    }

    /**
     * Playing music
     * @param { VoiceChannel } channel
     * @param { string } track
     */
    async play(channel, track) {
        this.queue.push(track) // Add to queue

        if (!this.connection) {
            this.newVoiceConnection(channel)
        } else if (!this.dispatcher) {
            this.newDispatcher()
        }
    }

    /**
     * Force playing
     * @param { VoiceChannel } channel
     * @param { Track[] } tracks
     */
    async forcePlay(channel, tracks) {
        await this.newQueue() // Очистка очереди
        for (const track of tracks) this.queue.push(track.url) // Создание новой очереди
        this.queue.shuffle() // Shuffling

        if (!this.connection) {
            this.newVoiceConnection(channel)
        } else if (this.dispatcher) {
            fadeOut(this.dispatcher)
        } else {
            this.newDispatcher()
        }
    }

    /**
     * Creating connection to voice channel
     * @param { VoiceChannel } channel
     */
    async newVoiceConnection(channel) {
        this.connection = await channel.join()
        this.newDispatcher()

        this.connection.on('disconnect', async () => {
            this.newQueue()
            this.connection = null
            if (this.dispatcher) this.dispatcher.end()
        })
    }

    /**
     * Creating dispatcher and event listeners
     */
    async newDispatcher() {
        this.dispatcher = this.connection.play(ytdl(this.queue[0], { filter: 'audioonly' }), { volume: this.volume })

        this.queue.shift()

        // End of track
        this.dispatcher.on('end', async () => {
            if (this.queue[0]) {
                this.newDispatcher()
            } else {
                this.dispatcher = null
            }
        })

        this.dispatcher.on('finish', async () => {
            if (this.queue[0]) {
                this.newDispatcher()
            } else {
                this.dispatcher = null
            }
        })
    }

    /**
     * Volume changing
     * @param { number } volume
     */
    async volumeChange(volume) {
        this.volume = (BASE_VOLUME / 5) * volume
        this.dispatcher.setVolume(this.volume)
    }

    /**
     * Skipping
     */
    skip() {
        if (!this.dispatcher) return 0
        fadeOut(this.dispatcher)

        return 1
    }

    /**
     * Stopping
     */
    stop() {
        if (!this.dispatcher) return 0
        this.newQueue()
        fadeOut(this.dispatcher)

        return 1
    }

    /**
     * Queue clearing
     */
    newQueue() {
        this.queue = new ShuffleableArray()
    }

    /**
     * @returns { boolean }
     */
    isPlaying() {
        return !!this.dispatcher
    }
}
