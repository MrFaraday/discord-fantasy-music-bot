import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'
import { concat } from '../utils/string'

export default async function helpHandler (
    this: Client,
    { message, args }: CommadHandlerParams
): Promise<void | Message> {
    if (!this.user) return
    const isVerbose = 'v' === args[1].toLowerCase()

    const verbosePart = concat([
        '',
        '- supported source: YouTube',
        '- max queue size is 50 items',
        '- during idle I will leave voice channel after 5 minutes automatically',
        '',
        'Command prefix:',
        `Mention me to use command without prefix: <@${this.user.id}> \`[command]\``,
        'If prefix defined add it right before each command, e.g. `~p` `$v`',
        '',
        '[Support Server](https://discord.gg/a68EqssbfT)'
    ])

    const helpEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Commands')
        .setDescription(
            concat([
                '`help [v?]` show list of commands, add ***v*** for more info',
                '`p [url]` play track(playlist) from URL or add to queue',
                '`fp [url]` clear queue and play shuffled playlist or track immediately',
                '`[0..9]` play saved tracks immediately, equal to ***fp [saved url]***',
                '`n` skip current track',
                '`s` stop playing and clear queue',
                '`v [0..200?]` display or set volume',
                '`d` disconnect from a voice channel',
                '`save [0..9] [url] [name?]` bind url to number, rest of input will be name but it optional',
                '`slots` show saved URLs',
                '`prefix [value]` set prefix for commands, enter ***none*** to remove it',
                isVerbose && verbosePart
            ])
        )

    return await message.channel.send(helpEmbed)
}
