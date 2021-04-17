import { Message } from 'discord.js'

export default async function stopHandler ({
    message,
    guild
}: CommadHandlerParams): Promise<void | Message> {
    if (guild.isPlaying()) {
        return guild.stop()
    } else {
        return await message.reply('Nothing to stop')
    }
}
