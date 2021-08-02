import youtubeApi from './api/youtube-api'
import SourceError from './source-error'

export default async function issueTracks (url: string): Promise<Track[]> {
    let tracks: Track[] = []

    const parseData = youtubeApi.parseUrl(url)
    console.log(parseData)

    if (!parseData) {
        return assert()
    }

    if (parseData.id) {
        const track = await youtubeApi.issueTrack(parseData.id)
        tracks = [track]
    } else if (parseData.list) {
        tracks = await youtubeApi.issueTracks(parseData.list)

        if (tracks.length === 0) {
            throw new SourceError('It\'s empty')
        }
    } else {
        assert()
    }

    return tracks
}

const assert = (): never => {
    throw new SourceError('I can\'t resolve link or something else')
}
