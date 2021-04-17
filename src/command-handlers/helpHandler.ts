import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'

export default async function helpHandler (
    this: Client,
    { message }: CommadHandlerParams
): Promise<Message> {
    const helpEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Commands')
        .setDescription(
            `
        \`p [url]\` play track(playlist) from URL or add to queue\n\
        \`fp [url]\` same but clear queue before\n\
        \`[0..9]\` play saved tracks immediately, if it's list — shuffle it\n\
        \`help\` list of commands\n\
        \`n\` skip curent track\n\
        \`s\` stop playing and clear queue\n\
        \`v [0..200?]\` display or set volume\n\
        \`d\` disconnect from a voice channel, during idle it will disconnect after 5 minutes automatically\n\
        \`save [0..9] [url] [name?]\` bind url to slot, rest of input will be name but it optional\n\
        \`slots\` show saved URLs\n\
        \`prefix [value]\` set new prefix for commands, enter *none* to remove it\n\
        \n\
        If you set prefix add it right before each command: \`!p\` \`#v\`. No prefix by default\n\
        Call without prefix: \`${this.user?.username ?? 'Unknown'}! [command]\`\n\
        \n\
        [***Support***](https://github.com/mr-faraday/discord-fantasy-music-bot/issues)\n\
        `
        )

    return await message.channel.send(helpEmbed)
}
