const { MessageEmbed } = require('discord.js')
const list = require('../config/tracks.config.json')

/**
 * @type { MessageHandler }
 */
module.exports = async function help ({ message }) {
    return message.channel.send(helpEmbed)
}

const helpEmbed = new MessageEmbed().setColor('#f26d53').setTitle('Commands').setDescription(
    `
    help — list of commands\n\
    p [url] — play track or add to queue\n\
    fp [url] — same but clear queue before\n\
    n — skip track\n\
    s — stop playing\n\
    v [volume] — set volume, default 5\n\
    1..7 — play preset\n\
    \n\
    1: [Peaceful](${list.peaceful})\n\
    2: [Combat](${list.combat})\n\
    3: [Dungeon](${list.dungeon})\n\
    4: [City](${list.city})\n\
    5: [Bossfight](${list.boss})\n\
    6: [Mystery](${list.mystery})\n\
    7: [Tavern](${list.tavern})\n\
    `
)
