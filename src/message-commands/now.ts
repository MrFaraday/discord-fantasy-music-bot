import { Client, Message } from 'discord.js'

async function handler (
    this: Client,
    { guild, message }: MessageCommadHandlerParams
): Promise<void | boolean | Message> {
    const embed = guild.trackEmbed
    if (embed) {
        embed.setAuthor('Playing')
        return await message.channel.send({ embeds: [embed] })
    }
}

export default {
    aliases: ['now'],
    helpSort: 6,
    helpInfo: '`now` display current playing track',
    handler
}
