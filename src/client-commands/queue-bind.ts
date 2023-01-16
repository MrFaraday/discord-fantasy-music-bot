import { ChannelType, Client, Message } from 'discord.js'
import issueTracks from '../issue-tracks'
import SourceError from '../source-error'
import { SlashCommandBuilder } from '@discordjs/builders'
import GuildSession from '../guild-session'

const interactionName = 'queue-bind'

async function messageHandler (
    this: Client,
    { message, guild, args }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (!message.member) return

    const bind = Number(args[1])
    if (!message.member) return

    guild.journal.log(`queue bind | message: ${message.id}`)

    const saved = guild.binds.get(bind)
    if (!saved) return

    if (message.member.voice.channel?.type !== ChannelType.GuildVoice) {
        return await message.channel.send('You are not connected to a voice channel')
    }

    try {
        const { tracks, embed } = await issueTracks(guild.guildId, saved.value)

        if (embed) {
            message.channel.send({ embeds: [embed] }).catch(() => 0)
        }

        return await guild.play(message.member.voice.channel, tracks, message.channel)
    } catch (error) {
        if (error instanceof SourceError) {
            return await message.channel.send(error.message)
        } else {
            guild.journal.warn(error)
            return await message.channel.send('It\'s hidden or something went wrong')
        }
    }
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void> {
    console.debug(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName('queue-bind')
    .setDescription('push binded track or playlist to the end of queue')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['qb'],
    sort: 2.5,
    helpInfo: '`qb [bind]` paush binded track or playlist to the end of queue',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
