import { Client, Message, MessageEmbed } from 'discord.js'
import { EMBED_COLOR } from '../config'
import { concat } from '../utils/string'
import { SlashCommandBuilder } from '@discordjs/builders'
import GuildSession from '../guild-session'

const interactionName = 'help'

async function messageHandler (
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

    const commandList = commands
        .filter((c): c is Command<any> & { helpInfo: string } => 'helpInfo' in c)
        .map((c) => c.helpInfo)
    const description = concat(commandList)

    const helpEmbed = new MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle('Commands')
        .setDescription(concat([description, isVerbose && verbosePart]))

    return await message.channel.send({ embeds: [helpEmbed] })
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void> {
    console.debug(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show list of commands')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['help'],
    sort: 0,
    helpInfo: '`help [v?]` show list of commands, add ***v*** for more info',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
