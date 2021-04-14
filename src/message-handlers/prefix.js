const db = require('../db')

/**
 * @type { MessageHandler }
 */
module.exports = async function prefix ({ guild, args, message }) {
    const currentPrefix = guild.prefix
    const [, newPrefix] = args

    if (!newPrefix && currentPrefix) {
        return message.reply(`Current prefix: **${currentPrefix}**`)
    } else if (!newPrefix && !currentPrefix) {
        return message.reply('There is no prefix')
    } else if (newPrefix.length > 3 && newPrefix !== 'none') {
        return message.reply('Too long, maximum 3 of characters')
    }

    const setPrefixQuery = 'UPDATE guild SET command_prefix = $1 WHERE id = $2'

    if (newPrefix === 'none') {
        guild.prefix = ''
        await db.query(setPrefixQuery, ['', String(message.guild.id)])
        return message.reply('Prefix removed')
    } else {
        guild.prefix = newPrefix
        await db.query(setPrefixQuery, [newPrefix, String(message.guild.id)])
        return message.reply(`New prefix: **${newPrefix}**`)
    }
}
