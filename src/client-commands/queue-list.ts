import { Client, EmbedBuilder, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import GuildSession from '../guild-session'
import { EMBED_COLOR } from '../config'

const interactionName = 'queue-list'

async function messageHandler (
    this: Client,
    { message, guild, args }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (!message.member) return
    if (args[1]) return

    guild.journal.log(`queue list | message: ${message.id}`)

    const current = guild.currentTrack
    const list = current ? [current, ...guild.queue] : guild.queue

    let body: string

    if (!current && !list.length) {
        body = 'No enqueued tracks'
    } else {
        body = list
            .map((track, i) => {
                // const record = `[${track.title}](${track.url})`
                let record = track.title

                if (record.length > 70) {
                    record = record.slice(0, 70) + '...'
                }

                if (i > 0) {
                    return `${i}. ` + record
                }

                return record + ' – playing'
            })
            .join('\n')
    }

    if (guild.queue.length) {
        body += '\n' + '\n' + `Total: ${guild.queue.length}`
    }

    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Queue List' })
        .setColor(EMBED_COLOR)
        .setDescription(body)

    await message.channel.send({ embeds: [embed] }).catch(() => 0)
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void> {
    console.debug(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName('queue-list')
    .setDescription('display queue')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['ql'],
    sort: 3.5,
    helpInfo: '`ql` display queue',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
