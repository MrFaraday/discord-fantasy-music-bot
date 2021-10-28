import { AudioResource, createAudioResource } from '@discordjs/voice'
import { MessageEmbed, TextBasedChannels } from 'discord.js'
import { EMBED_COLOR } from './config'
import ytdl from 'ytdl-core-discord'

interface TrackData {
    url: string
    title: string
    thumbnail: string
    textChannel: TextBasedChannels
}

export class Track implements TrackData {
    public readonly url: string
    public readonly title: string
    public readonly thumbnail: string
    public readonly textChannel: TextBasedChannels

    constructor (trackData: TrackData) {
        this.url = trackData.url
        this.title = trackData.title
        this.thumbnail = trackData.thumbnail
        this.textChannel = trackData.textChannel
    }

    async onStart (): Promise<void> {
        const embed = new MessageEmbed({
            title: this.title,
            color: EMBED_COLOR
        })
            .setAuthor('Playing')
            .setThumbnail(this.thumbnail)
            .setURL(this.url)

        try {
            await this.textChannel.send({ embeds: [embed] })
        } catch (error) {
            // unable to send embed
        }
    }

    public async createAudioResource (): Promise<AudioResource<Track>> {
        try {
            const stream: Stream = await ytdl(this.url)

            return createAudioResource(stream, {
                metadata: this,
                inlineVolume: true
            })
        } catch (error) {
            console.error('createAudioResource |', error)
            throw error
        }
    }
}
