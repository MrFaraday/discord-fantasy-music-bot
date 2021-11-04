import { AudioResource, createAudioResource } from '@discordjs/voice'
import { MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from './config'

import { video_info, stream_from_info } from 'play-dl'
import prism from 'prism-media'
import { pipeline, Readable } from 'stream'
import { LiveStreaming } from 'play-dl/dist/YouTube/classes/LiveStream'
import { YouTubeVideo } from 'play-dl/dist/YouTube/classes/Video'
import { assertType } from './utils/assertion'

const maxAttempts = 3

interface TrackData {
    url: string
    title: string
    thumbnail?: string
}

export class Track implements TrackData {
    public readonly url: string
    public readonly title: string
    public readonly thumbnail?: string

    private attempts = 0
    private videoInfo?: VideoInfo

    constructor (trackData: TrackData) {
        this.url = trackData.url
        this.title = trackData.title
        this.thumbnail = trackData.thumbnail
    }

    getMessageEmbed (): MessageEmbed {
        const embed = new MessageEmbed({
            title: this.title,
            color: EMBED_COLOR
        }).setURL(this.url)

        if (this.thumbnail) {
            embed.setThumbnail(this.thumbnail)
        }

        return embed
    }

    public async createAudioResource (): Promise<AudioResource<Track>> {
        if (this.attempts >= maxAttempts) {
            console.log('MAX ATTEMPTS EXCEEDED')
            throw new CreateResourceError(CreateResourceError.MAX_ATTEMPTS_EXCEEDED)
        }

        try {
            this.attempts++

            if (!this.videoInfo) {
                this.videoInfo = (await video_info(this.url)) as VideoInfo
            }

            if (
                this.videoInfo.video_details.durationInSec !== 0 &&
                this.videoInfo.format.some(hasProperVideoFormat)
            ) {
                const demuxer = new prism.opus.WebmDemuxer()
                const stream = await stream_from_info(this.videoInfo)

                assertType<Readable>(
                    stream.stream,
                    stream.stream instanceof Readable,
                    'stream type error'
                )

                const source = pipeline([stream.stream, demuxer], () => 0)

                assertType<Readable>(
                    source,
                    source instanceof Readable,
                    'stream type error'
                )

                return createAudioResource(source, {
                    inlineVolume: true,
                    metadata: this
                })
            } else if (
                this.videoInfo.LiveStreamData.isLive === true &&
                this.videoInfo.LiveStreamData.hlsManifestUrl !== null &&
                this.videoInfo.video_details.durationInSec === 0
            ) {
                const stream = new LiveStreaming(
                    this.videoInfo.LiveStreamData.dashManifestUrl,
                    this.videoInfo.format[
                        this.videoInfo.format.length - 1
                    ].targetDurationSec,
                    this.videoInfo.video_details.url
                )

                return createAudioResource(stream.stream, {
                    inputType: stream.type,
                    inlineVolume: true,
                    metadata: this
                })
            } else {
                console.log(
                    '>> createAudioResource | fallback to starndard stream creation'
                )

                const stream = await stream_from_info(this.videoInfo)

                return createAudioResource(stream.stream, {
                    inputType: stream.type,
                    inlineVolume: true,
                    metadata: this
                })
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Got 429 from the request') {
                console.log(error)

                console.log('>> RETRYING |', error.message)
                return this.createAudioResource()
            } else if (
                error instanceof Error &&
                error.message.includes('While getting info from url')
            ) {
                throw new CreateResourceError(CreateResourceError.RESTRICTED)
            } else {
                console.error('>> UNHANDLED createAudioResource error')
                console.error(this)
                console.error(error)
                throw new CreateResourceError(CreateResourceError.UNKNOWN)
            }
        }
    }
}

export class CreateResourceError extends Error {
    public static UNAVAILABLE = 0
    public static MAX_ATTEMPTS_EXCEEDED = 1
    public static UNKNOWN = 2
    public static RESTRICTED = 3

    public code: number | null = null

    constructor (code: number, message?: string) {
        super(message)
        this.code = code

        Object.setPrototypeOf(this, CreateResourceError.prototype)
    }
}

function hasProperVideoFormat (format: unknown) {
    if (!isVideoFormat(format)) return false

    const info = /^(?:audio\/([^;]+)).+(?:codecs="([^"]+))/.exec(format.mimeType)
    let container
    let codecs

    if (info) {
        container = info[1]
        codecs = info[2]
    }

    return container === 'webm' && codecs === 'opus' && format.audioSampleRate == '48000'
}

const isVideoFormat = (data: unknown): data is VideoFormat => {
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof (data as VideoFormat).mimeType === 'string' &&
        typeof (data as VideoFormat).audioSampleRate === 'string' &&
        typeof (data as VideoFormat).url === 'string' &&
        typeof (data as VideoFormat).bitrate === 'number'
    )
}

interface VideoFormat {
    mimeType: string
    audioSampleRate: string
    url: string
    bitrate: number
}

interface VideoInfo {
    LiveStreamData: {
        isLive: boolean
        dashManifestUrl: any
        hlsManifestUrl: any
    }
    html5player: string
    format: any[]
    video_details: YouTubeVideo
    related_videos: string[]
}
