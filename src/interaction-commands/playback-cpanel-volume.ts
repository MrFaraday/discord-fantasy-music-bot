import { ButtonInteraction, Client } from 'discord.js'
import db from '../db'
import queries from '../db/queries'
import { assert } from '../utils/assertion'
import { clamp } from '../utils/number'

async function handler (
    this: Client,
    { interaction, guild }: InteractionHandlerParams
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

export default {
    interactionIds: [
        'playback-cpanel-reduce-volume-1',
        'playback-cpanel-increase-volume-1',
        'playback-cpanel-reduce-volume-5',
        'playback-cpanel-increase-volume-5'
    ],
    handler
}
