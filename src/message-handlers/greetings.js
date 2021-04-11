/**
 * @type { MessageHandler }
 */
module.exports = async function greetings ({ message }) {
    return message.reply('Hello :)')
}
