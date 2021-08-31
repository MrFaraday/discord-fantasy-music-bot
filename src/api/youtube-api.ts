import { URL } from 'url'
import axios from 'axios'
import { MAX_QUEUE_LENGTH, YOUTUBE_API_KEY } from '../config'
import ytdl from 'ytdl-core-discord'

if (!YOUTUBE_API_KEY) {
    throw new Error('Environment variable YOUTUBE_API_KEY not found')
}

const videoIdRegEx = /[?&]v=([^&?#/]+)/
const shortVideoIdRegEx = /^https?:\/\/youtu\.be\/([^&?#/]+)$/
const listIdRegEx = /[?&]list=([^&?#/]+)/

interface ListItem {
    title: string
    videoId: string
}

class YoutubeApi {
    private key: string

    constructor (apiKey: string) {
        this.key = apiKey
    }

    async getListContent (listId: string): Promise<ListItem[]> {
        try {
            const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
            url.searchParams.append('key', this.key)

            const { data } = await axios.get<YoutubePlaylistItemListResponse>(url.href, {
                params: {
                    part: 'snippet',
                    playlistId: listId,
                    maxResults: MAX_QUEUE_LENGTH
                }
            })

            return data.items.map(({ snippet }) => ({
                title: snippet.title,
                videoId: snippet.resourceId.videoId
            }))
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new YoutubeApiError('Playlist not found', YoutubeApiError.NOT_FOUND)
            } else {
                assert(error)
            }
        }
    }

    async getVideoTitle (id: string): Promise<string> {
        try {
            const url = new URL('https://www.googleapis.com/youtube/v3/videos')
            url.searchParams.append('key', this.key)

            const { data } = await axios.get<YoutubeVideoListResponse>(url.href, {
                params: { part: 'snippet', id, maxResults: 1 }
            })

            if (data.items.length === 0) {
                throw new YoutubeApiError('Video not found', YoutubeApiError.NOT_FOUND)
            }

            return data.items[0].snippet.title
        } catch (error) {
            assert(error)
        }
    }

    parseUrl (url: string) {
        const [, videoId] = videoIdRegEx.exec(url) ?? []
        const [, shortVideoId] = shortVideoIdRegEx.exec(url) ?? []
        const [, listId] = listIdRegEx.exec(url) ?? []

        return { videoId: videoId ?? shortVideoId, listId }
    }

    /**
     * @param id video id
     */
    buildPlayLink (id: string) {
        return 'http://www.youtube.com/watch?v=' + id
    }

    /**
     * Get Track from video id
     */
    async issueTrack (videoId: string): Promise<Track> {
        const url = this.buildPlayLink(videoId)

        return {
            title: await this.getVideoTitle(videoId),
            getStream: () => ytdl(url),
            meta: [['url', url]]
        }
    }

    /**
     * Get Tracks from listId
     */
    async issueTracks (listId: string): Promise<Track[]> {
        const listContent = await this.getListContent(listId)

        return listContent.map(({ title, videoId }) => {
            const url = this.buildPlayLink(videoId)

            return {
                title,
                getStream: () => ytdl(url),
                meta: [['url', url]]
            }
        })
    }

    async isSourceExist (url: string) {
        try {
            const parseData = this.parseUrl(url)

            if (parseData.videoId) {
                await this.issueTrack(parseData.videoId)
            } else if (parseData.listId) {
                await this.issueTracks(parseData.listId)
            } else {
                throw new YoutubeApiError('Invalid URL', YoutubeApiError.BAD)
            }

            return true
        } catch (error) {
            if (
                error instanceof YoutubeApiError &&
                (error.code === YoutubeApiError.NOT_FOUND ||
                    error.code === YoutubeApiError.BAD)
            ) {
                return false
            } else {
                throw error
            }
        }
    }
}

function assert (error: unknown): never {
    if (axios.isAxiosError(error) && error.response) {
        throw new Error(`request failed, status: ${error.response.status}`)
    } else if (axios.isAxiosError(error) && error.request) {
        throw new Error('request failed, no response')
    } else {
        throw error
    }
}

const youtubeApi = new YoutubeApi(YOUTUBE_API_KEY)

export default youtubeApi

export class YoutubeApiError {
    static NOT_FOUND = 404
    static BAD = 400

    message: string
    code: number

    constructor (message: string, code: number) {
        this.message = message
        this.code = code
    }
}

// Responses

interface YoutubeResponse {
    etag: unknown
    nextPageToken: string
    prevPageToken: string
    pageInfo: {
        totalResults: number
        resultsPerPage: number
    }
}

interface YoutubePlaylistItemListResponse extends YoutubeResponse {
    kind: 'youtube#playlistItemListResponse'
    items: YoutubePlaylistItemListResponseItem[]
}

interface YoutubeVideoListResponse extends YoutubeResponse {
    kind: 'youtube#videoListResponse'
    items: YoutubeVideoListResponseItem[]
}

// Items

interface ResponseItem {
    etag: unknown
    id: string
}

interface YoutubePlaylistItemListResponseItem extends ResponseItem {
    kind: 'youtube#playlistItem'
    snippet: PlaylistItemSnippet
}

interface YoutubeVideoListResponseItem extends ResponseItem {
    kind: 'youtube#video'
    snippet: VideoSnippet
}

// Snippets

interface Snippet {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
        default: Thumbnail<120, 90>
        medium: Thumbnail<320, 180>
        high: Thumbnail<480, 360>
        standard: Thumbnail<640, 480>
        maxres: Thumbnail<1280, 720>
    }
    channelTitle: string
    localized: {
        title: string
        description: string
    }
}

interface PlaylistItemSnippet extends Snippet {
    playlistId: string
    position: number
    resourceId: {
        kind: 'youtube#video'
        videoId: string
    }
    videoOwnerChannelTitle: string
    videoOwnerChannelId: string
}

interface VideoSnippet extends Snippet {
    tags: string[]
    categoryId: number
    liveBroadcastContent: string
}

interface Thumbnail<W, H> {
    url: string
    width: W
    height: H
}
