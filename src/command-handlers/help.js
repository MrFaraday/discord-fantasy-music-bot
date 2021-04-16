const { MessageEmbed } = require('discord.js')
const { EMBED_COLOR } = require('../config')
const { shortString } = require('../utils/string')

/**
 * @type { MessageHandler }
 */
module.exports = async function help ({ message, guild }) {
    const slots = [...guild.slots]

    const slotRecords = slots
        .map(([slot, { name, value }]) => `${slot}: [${name || shortString(value)}](${value})`)
        .join('\n')

    const helpEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Commands')
        .setDescription(
            `
        Add prefix before each command, no prefix by default\n\
        Call without prefix: \`${this.user.username}! [command]\`\n\
        \n\
        \`p [url]\` play track(list) or add to queue\n\
        \`fp [url]\` same but clear queue before\n\
        \`[0..9]\` play saved tracks immediately, if it's list — shuffle it\n\
        \`help\` list of commands\n\
        \`n\` skip curent track\n\
        \`s\` stop playing, clear queue\n\
        \`v [0..100?]\` display or set volume, default ***50***\n\
        \`d\` disconnect from voice channel\n\
        \`save [0..9] [url] [name?]\` bind url to slot, field name is optional, type without spaces\n\
        \`prefix [value]\` set new prefix for commands; enter *none* to remove it\n\
        \n\
        Slots:\n\
        ${slotRecords || '***Empty***'}\n\
        \n\
        [***Support***](https://github.com/MrFaraday/discord-fantasy-music-bot/issues)\n\
        `
        )

    return await message.channel.send(helpEmbed)
}
