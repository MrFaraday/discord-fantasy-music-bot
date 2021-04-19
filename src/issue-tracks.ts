import youtubeApi from './api/youtube-api'
import SourceError from './source-error'

export default async function issueTracks (url: string): Promise<Track[]> {
    let tracks: Track[] = []

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
        throw new SourceError('I can\'t resolve link or something else')
    }

    return tracks
}
