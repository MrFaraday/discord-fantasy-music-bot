/**
 * @type { MessageHandler }
 */
module.exports = async function greetings ({ message }) {
    return await message.reply('Hello :)')
}
