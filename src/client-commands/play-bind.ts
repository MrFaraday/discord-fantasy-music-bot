import { Client, Message } from 'discord.js'
import issueTracks from '../issue-tracks'
import SourceError from '../source-error'
import { SlashCommandBuilder } from '@discordjs/builders'

async function handler (
    this: Client,
    { message, guild, args }: MessageCommadHandlerParams
): Promise<Message | void> {
    const bind = Number(args[0])

    if (args[1]) return
    if (!message.member) return

    const saved = guild.binds.get(bind)
    if (!saved) return

    if (message.member.voice.channel?.type !== 'GUILD_VOICE') {
        return await message.channel.send('You are not connected to a voice channel')
    }

    try {
        const { tracks } = await issueTracks(saved.value)
        return await guild.forcePlay(
            message.member.voice.channel,
            tracks,
            message.channel
        )
    } catch (error) {
        if (error instanceof SourceError) {
            return await message.channel.send(error.message)
        } else {
            console.warn(error)
            return await message.channel.send('It\'s hidden or something went wrong')
        }
    }
}

async function interactionHandler (
    this: Client,
    { guild, interaction }: InterationHandlerParams
): Promise<void | Message> {
    console.log(interaction)
    await Promise.resolve()
}

const slashConfig = new SlashCommandBuilder()
    .setName('play-bind')
    .setDescription('Play binded link')

    interface ExecutorParams {
        changeIt: number
    }
    
async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand = {
    commandMessageNames: new Array(16).fill(0).map((_, i) => String(i)),
    sort: 2,
    helpInfo: '`[0..15]` play saved tracks immediately, equal to ***fp [saved link]***',
    slashConfig,
    messageHandler: handler
}

export default command
