import { MessageEmbed, TextBasedChannels } from 'discord.js'
import { EMBED_COLOR } from './config'

interface TrackData {
    url: string
    title: string
    thumbnail: string
    textChannel: TextBasedChannels
    getStream: () => Promise<Stream>
}

export class Track implements TrackData {
    public readonly url: string
    public readonly title: string
    public readonly thumbnail: string
    public readonly textChannel: TextBasedChannels
    public readonly getStream: () => Promise<Stream>

    constructor (trackData: TrackData) {
        this.url = trackData.url
        this.title = trackData.title
        this.thumbnail = trackData.thumbnail
        this.textChannel = trackData.textChannel
        this.getStream = trackData.getStream
    }

    async onStart (): Promise<void> {
        const embed = new MessageEmbed({
            title: this.title,
            color: EMBED_COLOR
        })
            .setThumbnail(this.thumbnail)
            .setURL(this.url)

        try {
            await this.textChannel.send({ embeds: [embed] })
        } catch (error) {
            console.warn(error)
            // unable to send embed
        }
    }
}
