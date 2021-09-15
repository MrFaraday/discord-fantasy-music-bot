import youtubeApi from './api/youtube-api'
import SourceError from './source-error'

export default async function issueTracks (query: string): Promise<Track[]> {
    let tracks: Track[] = []

    const urlData = youtubeApi.parseUrl(query)

    if (urlData.videoId) {
        const track = await youtubeApi.issueTrack(urlData.videoId)
        tracks = [track]
    } else if (urlData.listId) {
        tracks = await youtubeApi.issueTracks(urlData.listId)

        if (tracks.length === 0) {
            throw new SourceError('It\'s empty')
        }
    } else if (query.length < 3) {
        throw new SourceError('Query is too short')
    } else {
        const track = await youtubeApi.search(query)
        console.log(track.meta?.find(([tag]) => tag === 'url'))

        tracks = [track]
    }

    return tracks
}
