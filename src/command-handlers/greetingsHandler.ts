import { Message } from 'discord.js'

/**
 * Just hello message
 */
export default async function greetingsHandler ({
    message
}: CommadHandlerParams): Promise<Message> {
    return await message.reply('Hello :)')
}
