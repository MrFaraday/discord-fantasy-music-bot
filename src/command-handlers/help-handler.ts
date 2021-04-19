import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'

export default async function helpHandler (
    this: Client,
    { message, guild }: CommadHandlerParams
): Promise<Message> {
    const withPrefix = `Current prefix: \`${guild.prefix}\`. Add prefix right before each command, e.g. \`${guild.prefix}p\` \`${guild.prefix}v\``

    const prefixPart = guild.prefix ? withPrefix : 'There is currently no prefix.'

    const helpEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Commands')
        .setDescription(
            `
            \`p [url]\` play track(playlist) from URL or add to queue, max queue size is 50 items\n\
            \`fp [url]\` clear queue and play track(playlist) immediately, if it's playlist — shuffle it before\n\
            \`[0..9]\` play saved tracks immediately, equal to ***fp [saved url]***\n\
            \`help\` list of commands\n\
            \`n\` skip current track\n\
            \`s\` stop playing and clear queue\n\
            \`v [0..200?]\` display or set volume\n\
            \`d\` disconnect from a voice channel, during idle it will disconnect after 5 minutes automatically\n\
            \`save [0..9] [url] [name?]\` bind url to slot, rest of input will be name but it optional\n\
            \`slots\` show saved URLs\n\
            \`prefix [value]\` set prefix for commands, enter ***none*** to remove it\n\
            \n\
            Command prefix:\n\
            Mention me to use command without prefix: <@${
    this.user?.id ?? 'Unknown'
}> \`[command]\`\n\
            ${prefixPart}\n\
            \n\
            [Support Server](https://discord.gg/a68EqssbfT)
        `
        )

    return await message.channel.send(helpEmbed)
}
