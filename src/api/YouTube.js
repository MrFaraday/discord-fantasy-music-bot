const axios = require('axios').default

module.exports = class YouTube {
    constructor(key) {
        const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems')
        url.searchParams.append('key', key)

        this.baseUrl = url.href
    }

    async getListContent(id) {
        try {
            const { data } = await axios.get(this.baseUrl, {
                params: {
                    part: 'snippet',
                    playlistId: id,
                    maxResults: 50
                }
            })

            const itemsIDs = data.items.map((item) => item.snippet.resourceId.videoId)

            return itemsIDs
        } catch (error) {
            throw new Error('request failed')
        }
    }
}
