import { Guild, VoiceChannel, StreamDispatcher, VoiceConnection } from 'discord.js'
import ytdl from 'ytdl-core'  // youtube downloader
import ShuffleableArray from './ShuffleableArray'  // Extended array class
import { fadeOut } from '../libs/effects'  // Effects
import { Track } from '../interfaces'

const BASE_VOLUME = 0.15  // Default volume

export default class GuildConnection {
  guild: Guild
  volume: number
  queue: ShuffleableArray<string>
  dispatcher: StreamDispatcher
  connection: VoiceConnection

  constructor(guild: Guild) {
    console.log(`Connected to guild   -   ${guild.name}`)
    this.newQueue()  // Creating new queue
    this.guild = guild  // Link to instance of Discord Guild
    this.volume = BASE_VOLUME
  }

  // Playing music
  async play(channel: VoiceChannel, track: string) {
    this.queue.push(track)  // Add to queue

    if (!this.connection) {
      this.newVoiceConnection(channel)
    } else if (!this.dispatcher) {
      this.newDispatcher()
    }
  }

  // Force playing
  async forcePlay(channel: VoiceChannel, tracks: Track[]) {
    await this.newQueue()  // Очистка очереди
    for (const track of tracks) this.queue.push(track.url)  // Создание новой очереди
    this.queue.shuffle()  // Shuffling

    if (!this.connection) {
      this.newVoiceConnection(channel)
    } else if (this.dispatcher) {
      fadeOut(this.dispatcher)
    } else {
      this.newDispatcher()
    }
  }

  // Подключение к голосовому каналу
  async newVoiceConnection(channel: VoiceChannel) {
    this.connection = await channel.join()
    this.newDispatcher()

    this.connection.on('disconnect', async () => {
      console.log(`${this.guild.name}: disconnected out of the voice channel`)
      this.newQueue()
      this.connection = null
      if (this.dispatcher) this.dispatcher.end()
    })

    this.connection.on('failed', async error => {
      console.log(`Voice connection failed: ${error}`)
    })

    this.connection.on('error', async error => {
      console.log(`Voice connection error: ${error}`)
    })

    this.connection.on('warn', async warn => {
      console.log(`Voice connection warn: ${warn}`)
    })
  }

  // Creating dispatcher and event listeners
  async newDispatcher() {
    console.log(`New dispatcher   -   ${this.guild.name}`)
    this.dispatcher = this.connection.play(
      ytdl(this.queue[0], { filter: 'audioonly' }),
      { volume: this.volume }
    )

    this.queue.shift()

    // End of track
    this.dispatcher.on('close', async () => {
      if (this.queue[0]) this.newDispatcher()
      else this.dispatcher = null
    })
  }

  // Изменение громкости
  async volumeChange(volume: number) {
    this.volume = (BASE_VOLUME / 5) * volume
    this.dispatcher.setVolume(this.volume)
  }

  // Skipping
  async skip() {
    if (!this.dispatcher) return 0
    fadeOut(this.dispatcher)

    return 1
  }

  // Stopping
  async stop() {
    if (!this.dispatcher) return 0
    await this.newQueue()
    fadeOut(this.dispatcher)

    return 1
  }

  // Queue clear
  async newQueue() {
    this.queue = new ShuffleableArray<string>()
  }
}
