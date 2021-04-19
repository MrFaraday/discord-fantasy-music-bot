import { Client, Message } from 'discord.js'

/**
 * Just hello message
 */
export default async function greetingsHandler (
    this: Client,
    { message }: CommadHandlerParams
): Promise<Message> {
    return await message.channel.send('Hello :)')
}
