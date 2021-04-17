import { Message } from 'discord.js'

export default async function nextHandler ({
    message,
    guild
}: CommadHandlerParams): Promise<void | Message> {
    if (guild.isPlaying()) {
        return guild.skip()
    } else {
        return await message.reply('Nothing to skip')
    }
}
