import { TextBasedChannels } from 'discord.js'
import youtubeApi from './api/youtube-api'
import SourceError from './source-error'
import { Track } from './track'

export default async function issueTracks (
    query: string,
    channel: TextBasedChannels
): Promise<Track[]> {
    let tracks: Track[] = []

    const urlData = youtubeApi.parseUrl(query)

    if (urlData.videoId) {
        const track = await youtubeApi.issueTrack(urlData.videoId, channel)
        tracks = [track]
    } else if (urlData.listId) {
        tracks = await youtubeApi.issueTracks(urlData.listId, channel)

        if (tracks.length === 0) {
            throw new SourceError('It\'s empty')
        }
    } else if (query.length < 3) {
        throw new SourceError('Query is too short')
    } else if (query.length > 500) {
        throw new SourceError('Query is too long')
    } else {
        const track = await youtubeApi.search(query, channel)
        tracks = [track]
    }

    return tracks
}
