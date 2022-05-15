import { MessageEmbed } from 'discord.js'
import youtubeApi from './api/youtube-api'
import { EMBED_COLOR } from './config'
import SourceError from './source-error'
import { Track } from './track'
import { GuildJournal } from './journal'

export default async function issueTracks (
    guildId: string,
    query: string
): Promise<{ tracks: Track[]; embed?: MessageEmbed }> {
    let tracks: Track[] = []
    let embed: MessageEmbed | undefined

    const urlData = youtubeApi.parseUrl(query)

    const journal = new GuildJournal(guildId)
    journal.log(`Searching for ${query}, URL data: ${JSON.stringify(urlData)}`)

    if (urlData.videoId) {
        const track = await youtubeApi.issueTrack(urlData.videoId)
        tracks = [track]
    } else if (urlData.listId) {
        const result = await youtubeApi.issueTracks(urlData.listId)
        tracks = result.tracks

        if (tracks.length === 0) {
            throw new SourceError('It\'s empty')
        } else if (tracks.length > 1) {
            embed = new MessageEmbed()
                .setTitle(result.listData.title)
                .setAuthor({ name: 'Playlist enqueued' })
                .setColor(EMBED_COLOR)
                .setURL(query)

            if (result.listData.thumbnail) {
                embed.setThumbnail(result.listData.thumbnail)
            }
        }
    } else if (query.length < 3) {
        throw new SourceError('Query is too short')
    } else if (query.length > 500) {
        throw new SourceError('Query is too long')
    } else {
        const track = await youtubeApi.search(query)
        tracks = [track]
    }

    journal.log(`Tracks: ${JSON.stringify(tracks)}`)

    if (tracks.length === 1) {
        const [track] = tracks
        embed = track.getMessageEmbed().setAuthor({ name: 'Enqueued' })
    }

    return { tracks, embed }
}
