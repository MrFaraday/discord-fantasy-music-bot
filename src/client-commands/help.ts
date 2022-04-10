import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'
import { concat } from '../utils/string'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { message, args, commands }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (!this.user) return
    const isVerbose = 'v' === args[1]?.toLowerCase()

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

    const description = concat(commands.map((c) => c.helpInfo))
    const helpEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Commands')
        .setDescription(concat([description, isVerbose && verbosePart]))

    return await message.channel.send({ embeds: [helpEmbed] })
}

const slashConfig = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show list of commands')

const command: ClientCommand = {
    aliases: ['help'],
    sort: 0,
    helpInfo: '`help [v?]` show list of commands, add ***v*** for more info',
    slashConfig,
    handler
}

export default command
