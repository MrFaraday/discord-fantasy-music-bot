import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice'
import { MessageEmbed, TextBasedChannels } from 'discord.js'
import { EMBED_COLOR } from './config'
// import { raw as ytdl } from 'youtube-dl-exec'
// import ytdl from 'ytdl-core-discord'
import { stream as playStream } from 'play-dl'

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
            console.warn(error)
            // unable to send embed
        }
    }

    public async createAudioResource (): Promise<AudioResource<Track>> {
        // play-dl
        const stream = await playStream(this.url)
        return createAudioResource(stream.stream, {
            inputType: stream.type,
            inlineVolume: true
        })
        //
        // ytld-core
        //
        // try {
        //     const stream: Stream = await ytdl(this.url)
        //     // const probe = await demuxProbe(stream)
        //     play
        //     return createAudioResource(stream, {
        //         metadata: this,
        //         inputType: stream.type
        //     })
        // } catch (error) {
        //     console.error(error)
        //     throw error
        // }
        //
        // exec
        //
        // const process = ytdl(
        //     this.url,
        //     {
        //         o: '-',
        //         q: '',
        //         f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        //         r: '100K'
        //     },
        //     { stdio: ['ignore', 'pipe', 'ignore'] }
        // )
        // if (!process.stdout) {
        //     throw new Error('No stdout')
        // }
        // const stream = process.stdout
        // return new Promise((resolve, reject) => {
        //     const onError = (error: Error) => {
        //         if (!process.killed) process.kill()
        //         stream.resume()
        //         reject(error)
        //     }
        //     process
        //         .once('spawn', () => {
        //             demuxProbe(stream)
        //                 .then((probe) =>
        //                     resolve(
        //                         createAudioResource(probe.stream, {
        //                             metadata: this,
        //                             inputType: probe.type,
        //                             inlineVolume: true
        //                         })
        //                     )
        //                 )
        //                 .catch(onError)
        //         })
        //         .catch(onError)
        // })
    }
}
