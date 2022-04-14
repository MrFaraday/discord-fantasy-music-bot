import { ButtonInteraction, Client } from 'discord.js'
import db from '../db'
import queries from '../db/queries'
import GuildSession from '../guild-session'
import { assert } from '../utils/assertion'
import { clamp } from '../utils/number'

async function interactionHandler (
    this: Client,
    { interaction, guild }: InterationHandlerParams
): Promise<any> {
    if (!(interaction instanceof ButtonInteraction)) return
    if (!interaction.guild) return

    const multiplier = interaction.customId.includes('increase') ? 1 : -1
    const [value] = /\d/.exec(interaction.customId) ?? []
    assert(value)

    const delta = Number(value) * multiplier
    const resultVolume = clamp(guild.volume + delta, 0, 200)

    if (resultVolume !== guild.volume) {
        await db.query(queries.updateVolume, [resultVolume, interaction.guild.id])
        guild.changeVolume(resultVolume)
    }

    await interaction.update({ content: `Volume: **${resultVolume}**` })
}

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: InteractionCommand<ExecutorParams> = {
    commandInteractionNames: [
        'playback-cpad-reduce-volume-1',
        'playback-cpad-increase-volume-1',
        'playback-cpad-reduce-volume-5',
        'playback-cpad-increase-volume-5'
    ],
    interactionHandler,

    executor
}

export default command
