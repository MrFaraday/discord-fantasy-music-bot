const axios = require('axios').default
const ytdl = require('ytdl-core-discord')
const { YOUTUBE_API_KEY } = require('../config')

const videoIdRegEx = /[?&]v=([^&?#/]+)/i
const listIdRegEx = /[?&]list=([^&?#/]+)/

module.exports = {
    /**
     * @param { string } listId
     * @returns { Promise<{ title: string, videoId: string }[]> }
     */
    async getListContent (listId) {
        try {
            const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
            url.searchParams.append('key', YOUTUBE_API_KEY)
            const baseUrl = url.href

            const { data } = await axios.get(baseUrl, {
                params: {
                    part: 'snippet',
                    playlistId: listId,
                    maxResults: 50
                }
            })

            return data.items.map(({ snippet }) => ({
                title: snippet.title,
                videoId: snippet.resourceId.videoId
            }))
        } catch (error) {
            if (error.response) {
                throw new Error('request failed, status: ' + error.response.status)
            } else if (error.request) {
                throw new Error('request failed, no response')
            } else {
                throw error
            }
        }
    },

    /**
     * @param { string } id
     * @returns { Promise<string> }
     */
    async getVideoTitle (id) {
        try {
            const url = new URL('https://www.googleapis.com/youtube/v3/videos')
            url.searchParams.append('key', YOUTUBE_API_KEY)
            const baseUrl = url.href

            const { data } = await axios.get(baseUrl, {
                params: { part: 'snippet', id, maxResults: 1 }
            })

            if (data.items.length === 0) {
                throw new Error('Video not found')
            }

            return data.items[0].snippet.title
        } catch (error) {
            if (error.response) {
                throw new Error('request failed, status: ' + error.response.status)
            } else if (error.request) {
                throw new Error('request failed, no response')
            } else {
                throw error
            }
        }
    },

    /**
     * @param { string } url
     */
    parseUrl (url) {
        const [, videoId] = url.match(videoIdRegEx) || []
        const [, listId] = url.match(listIdRegEx) || []

        return { videoId, listId }
    },

    /**
     * @param { string } id video id
     */
    buildPlayLink (id) {
        return 'http://www.youtube.com/watch?v=' + id
    },

    /**
     * Get Track from video id
     * @param { string } videoId
     * @return { Promise<Track> }
     */
    async issueTrack (videoId) {
        const url = this.buildPlayLink(videoId)

        return {
            title: await this.getVideoTitle(videoId),
            getStream: () => ytdl(url),
            meta: [['url', url]]
        }
    },

    /**
     * Get Tracks from listId
     * @param { string } listId
     * @return { Promise<Track[]> }
     */
    async issueTracks (listId) {
        const listContent = await this.getListContent(listId)
        return listContent.map(({ title, videoId }) => {
            const url = this.buildPlayLink(videoId)

            return {
                name: title,
                getStream: () => ytdl(url),
                meta: [['url', url]]
            }
        })
    }
}
