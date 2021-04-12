const { MessageEmbed } = require('discord.js')

/**
 * @type { MessageHandler }
 */
module.exports = async function help ({ app, message, guild }) {
    const slots = [...guild.slots]

    const slotRecords = slots
        .map(([slot, { name, value }]) => `${slot}: [${name}](${value})`)
        .join('\n')

    const helpEmbed = new MessageEmbed().setColor('#f26d53').setTitle('Commands').setDescription(
        `
        Add prefix before each command, no prefix by default\n\
        Call without prefix: \`${app.user.username}! [command]\`\n\
        \n\
        \`help\` list of commands\n\
        \`[0..9]\` play saved tracks immediately, if it's list — shuffle it\n\
        \`p [url]\` play track(list) or add to queue\n\
        \`fp [url]\` same but clear queue before\n\
        \`n\` skip curent track\n\
        \`s\` stop playing, clear queue\n\
        \`v [volume]\` set volume, default \`5\`\n\
        \`d\` disconnect from voice channel\n\
        \`save [0..9] [url] [name?]\` bind url to slot, field name is optional, type without spaces\n\
        \`prefix [value]\` set new prefix for commands; enter \`none\` to remove it\n\
        \n\
        Slots:\n\
        ${slotRecords}
        `
    )

    return message.channel.send(helpEmbed)
}
