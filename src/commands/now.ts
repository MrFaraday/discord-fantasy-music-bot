import { Client, Message } from 'discord.js'

async function handler (
    this: Client,
    { guild, message }: CommadHandlerParams
): Promise<void | boolean | Message> {
    const embed = guild.trackEmbed
    if (embed) {
        embed.setAuthor('Playing')
        return await message.channel.send({ embeds: [embed] })
    }
}

export default {
    aliases: ['now'],
    sort: 11,
    helpInfo: '`drop [0..9]` delete binded link',
    handler
}
