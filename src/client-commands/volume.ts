import { Client, Message } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import db from '../db'
import queries from '../db/queries'
import GuildSession from '../guild-session'

const interactionName = 'volume'

async function messageHandler (
    this: Client,
    { message, guild, args }: MessageCommadHandlerParams
): Promise<void | Message> {
    if (!message.guild) return

    const [, volumeParam] = args
    const volume = Number(volumeParam)

    const currentVolume = guild.volume

    if (!volumeParam) {
        return await message.channel.send(`Current volume: **${currentVolume}%**`)
    } else if (Number.isNaN(volumeParam)) {
        return await message.channel.send('Must be a number')
    } else if (!Number.isInteger(volume)) {
        return await message.channel.send('Must be integer')
    } else if (volume < 0 || volume > 200) {
        return await message.channel.send('Must be from 0 to 200')
    }

    if (currentVolume !== volume) {
        await db.query(queries.updateVolume, [volume, message.guild.id])
        guild.changeVolume(Number(volume))
        await message.channel.send(`Volume set to **${volume}%**`)
    } else {
        await message.channel.send('It is current volume')
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
    .setName('volume')
    .setDescription('Change volume')

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: MessageCommand<ExecutorParams> & SlashCommand<ExecutorParams> = {
    commandMessageNames: ['v'],
    sort: 5,
    helpInfo: '`v [0..200?]` display or set volume',
    messageHandler,

    commandInteractionNames: [interactionName],
    slashConfig,
    interactionHandler,

    executor
}

export default command
