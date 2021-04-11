const list = require('../config/tracks.config.json')

/**
 * @type { MessageHandler }
 */
module.exports = async function playPreset ({ message, guild, args }) {
    if (args[1]) return
    if (!message.member.voice.channel) {
        message.reply('You are not connected to a voice channel...')
        return
    }

    try {
        const playlistLink = issuePlaylist(args[0])
        const listId = getListId(playlistLink)

        const itemsIDs = await ytApi.getListContent(listId)
        const links = itemsIDs.map(buildPlayLink)

        const playlist = links.map((url) => ({
            url
        }))

        await guild.forcePlay(message.member.voice.channel, playlist)
    } catch (error) {
        if (error.message === 'empty') {
            message.reply('Wow, It\'s empty...')
        } else {
            message.reply('Something went wrong.')
        }
    }
}

const issuePlaylist = (key) => {
    switch (key) {
        case '1':
            return list.peaceful
        case '2':
            return list.combat
        case '3':
            return list.dungeon
        case '4':
            return list.city
        case '5':
            return list.boss
        case '6':
            return list.mystery
        case '7':
            return list.tavern
        default:
            throw new Error('Wrong theme key.')
    }
}
