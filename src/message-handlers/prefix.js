/**
 * @type { MessageHandler }
 */
module.exports = function prefix ({ guild, args, message }) {
    const [, newPrefix] = args

    if (!newPrefix) {
        return message.reply('No prefix provided')
    } else if (newPrefix.length > 3 && newPrefix !== 'none') {
        return message.reply('Too long, maximum 3 of characters')
    }

    if (newPrefix === 'none') {
        guild.prefix = ''
        return message.reply('Prefix removed')
    } else {
        guild.prefix = newPrefix
        return message.reply(`New prefix: \`${newPrefix}\``)
    }
}
