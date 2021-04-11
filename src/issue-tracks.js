const youtubeApi = require('./api/youtube-api')
const SourceError = require('./source-error')

/**
 * @param { string } url
 */
module.exports = async function issueTracks (url) {
    /**
     * @type { Track[] }
     */
    let tracks = []

    const urlData = youtubeApi.parseUrl(url)

    if (urlData.videoId) {
        const track = await youtubeApi.issueTrack(urlData.videoId)
        tracks = [track]
    } else if (urlData.listId) {
        tracks = await youtubeApi.issueTracks(urlData.listId)

        if (tracks.length === 0) {
            throw new SourceError('It\'s empty')
        }
    } else {
        throw new SourceError('I can\'t resolve link or something else...')
    }

    return tracks
}
