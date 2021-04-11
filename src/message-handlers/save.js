const { shortString } = require('../utils/string')

const urlRegEx = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/

/**
 * @type { MessageHandler }
 */
module.exports = async function save ({ guild, args, message }) {
    const [, slotParam, url, slotName] = args
    const slot = Number(slotParam)

    if (!slot) {
        return message.reply('No params provided')
    } else if (Number.isNaN(slotParam)) {
        return message.reply('Slot must be a number')
    } else if (!Number.isInteger(slot)) {
        return message.reply('Slot number must be integer')
    } else if (slot < 0 || slot > 9) {
        return message.reply('Slot number must be from 0 to 9')
    } else if (!url) {
        return message.reply('No URL provided')
    } else if (url.length > 255) {
        return message.reply('Too long URL, maximum 255 of characters')
    } else if (!urlRegEx.test(url)) {
        return message.reply('It\'s not an URL, maybe')
    } else if (slotName && slotName.length > 50) {
        return message.reply('Name is too long, maximum 50 of characters')
    }

    const name = slotName || shortString(url)
    guild.slots.set(slot, { name, value: url })

    return message.reply('Saved!')
}
