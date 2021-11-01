import { URL } from 'url'
import axios from 'axios'
import { QUEUE_MAX_LENGTH, YOUTUBE_API_KEY } from '../config'
import { Track } from '../track'
import YtSearchService, { YtVideoSearchResult } from '../services/yt-search-service'

if (!YOUTUBE_API_KEY) {
    throw new Error('Environment variable YOUTUBE_API_KEY not found')
}

const videoIdRegEx = /[?&]v=([^&?#/]+)/
const shortVideoIdRegEx = /^https?:\/\/youtu\.be\/([^&?#/]+)$/
const listIdRegEx = /[?&]list=([^&?#/]+)/

interface ListItem {
    title: string
    videoId: string
    thumbnail?: string
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
                    maxResults: QUEUE_MAX_LENGTH
                }
            })

            return data.items.map(({ snippet }) => ({
                videoId: snippet.resourceId.videoId,
                title: snippet.title,
                thumbnail: getThumbnailUrl(snippet)
            }))
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new YoutubeApiError('Playlist not found', YoutubeApiError.NOT_FOUND)
            } else {
                assert(error)
            }
        }
    }

    async search (query: string): Promise<Track> {
        let result: YtVideoSearchResult | null = null

        try {
            result = await YtSearchService.search(query)
        } catch (error) {
            assert(error)
        }

        if (!result) {
            throw new YoutubeApiError('Not fonund', YoutubeApiError.NOT_FOUND)
        }

        const url = this.buildPlayLink(result.videoId)

        return new Track({
            url,
            title: result.title,
            thumbnail: result.thumbnail
        })
    }

    async getVideoSnippet (id: string): Promise<Snippet> {
        try {
            const url = new URL('https://www.googleapis.com/youtube/v3/videos')
            url.searchParams.append('key', this.key)

            const { data } = await axios.get<YoutubeVideoListResponse>(url.href, {
                params: { part: 'snippet', id, maxResults: 1 }
            })

            if (data.items.length === 0) {
                throw new YoutubeApiError('Video not found', YoutubeApiError.NOT_FOUND)
            }

            return data.items[0].snippet
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
        return 'https://www.youtube.com/watch?v=' + id
    }

    /**
     * Get Track from video id
     */
    async issueTrack (videoId: string): Promise<Track> {
        const url = this.buildPlayLink(videoId)
        const snippet = await this.getVideoSnippet(videoId)

        return new Track({
            url,
            title: snippet.title,
            thumbnail: getThumbnailUrl(snippet)
        })
    }

    /**
     * Get Tracks from listId
     */
    async issueTracks (listId: string): Promise<Track[]> {
        const listContent = await this.getListContent(listId)

        return listContent.map(({ title, videoId, thumbnail }) => {
            const url = this.buildPlayLink(videoId)

            return new Track({
                url,
                title,
                thumbnail
            })
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

const getThumbnailUrl = (snippet: Snippet): string | undefined => {
    const { default: def, high, maxres, medium, standard } = snippet.thumbnails
    return maxres?.url ?? standard?.url ?? high?.url ?? medium?.url ?? def?.url
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

interface YoutubeSearchListResponse extends YoutubeResponse {
    kind: 'youtube#searchListResponse'
    items: YoutubeSearchResponseItem[]
}

// Items

interface ResponseItem {
    etag: unknown
}

interface YoutubePlaylistItemListResponseItem extends ResponseItem {
    id: string
    kind: 'youtube#playlistItem'
    snippet: PlaylistItemSnippet
}

interface YoutubeVideoListResponseItem extends ResponseItem {
    id: string
    kind: 'youtube#video'
    snippet: VideoSnippet
}

interface YoutubeSearchResponseItem extends ResponseItem {
    id: {
        kind: 'youtube#video' | string
        videoId: string
    }
    kind: 'youtube#searchResult'
    snippet: VideoSnippet
}

// Snippets

interface Snippet {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
        default?: Thumbnail<120, 90>
        medium?: Thumbnail<320, 180>
        high?: Thumbnail<480, 360>
        standard?: Thumbnail<640, 480>
        maxres?: Thumbnail<1280, 720>
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
