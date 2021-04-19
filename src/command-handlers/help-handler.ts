import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'

export default async function helpHandler (
    this: Client,
    { message, args }: CommadHandlerParams
): Promise<void | Message> {
    if (!this.user) return
    const [, isVerbose] = args

    const verbosePart = `
    - supported source: YouTube\n\
    - max queue size is 50 items\n\
    - during idle I will leave voice channel after 5 minutes automatically\n\
    \n\
    Command prefix:\n\
    Mention me to use command without prefix: <@${this.user.id}> \`[command]\`\n\
    If prefix defined add it right before each command, e.g. \`~p\` \`$v\`\n\
    \n\
    [Support Server](https://discord.gg/a68EqssbfT)`

    const helpEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Commands')
        .setDescription(
            `\`help [v?]\` show list of commands, add ***v*** for more info\n\
            \`p [url]\` play track(playlist) from URL or add to queue\n\
            \`fp [url]\` clear queue and play shuffled playlist or track immediately\n\
            \`[0..9]\` play saved tracks immediately, equal to ***fp [saved url]***\n\
            \`n\` skip current track\n\
            \`s\` stop playing and clear queue\n\
            \`v [0..200?]\` display or set volume\n\
            \`d\` disconnect from a voice channel\n\
            \`save [0..9] [url] [name?]\` bind url to number, rest of input will be name but it optional\n\
            \`slots\` show saved URLs\n\
            \`prefix [value]\` set prefix for commands, enter ***none*** to remove it\n\
            ${isVerbose ? verbosePart : ''}
            `
        )

    return await message.channel.send(helpEmbed)
}
