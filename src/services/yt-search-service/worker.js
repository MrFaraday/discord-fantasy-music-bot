const { parentPort } = require('worker_threads')
const yts = require('yt-search')

parentPort.on('message', async (message) => {
    let uuid
    let query

    try {
        const request = JSON.parse(message)
        uuid = request[0]
        query = request[1]

        if (!uuid) {
            throw new TypeError('uuid is not porvided')
        } else if (!query) {
            throw new TypeError('query is not provided')
        }
    } catch (error) {
        return JSON.stringify({
            success: false,
            result: {
                message:
                    error?.message ?? 'YtServiceWorker | Parsing message unknown error'
            }
        })
    }

    try {
        const response = await yts({ query, pages: 1 })
        const video = response.videos[0]

        if (!video) {
            throw new Error('Video not found')
        }

        parentPort.postMessage(
            JSON.stringify({
                success: true,
                result: {
                    uuid,
                    searchResult: {
                        videoId: video.videoId,
                        title: video.title,
                        thumbnail: video.thumbnail
                    }
                }
            })
        )
    } catch (error) {
        parentPort.postMessage(
            JSON.stringify({
                success: false,
                result: {
                    uuid,
                    message: error?.message ?? 'YtServiceWorker | Unknown error'
                }
            })
        )
    }
})
