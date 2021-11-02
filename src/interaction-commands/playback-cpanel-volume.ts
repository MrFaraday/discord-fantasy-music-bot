import { ButtonInteraction, Client } from 'discord.js'
import db from '../db'
import queries from '../db/queries'
import { clamp } from '../utils/number'

async function handler (
    this: Client,
    { interaction, guild }: InteractionHandlerParams
): Promise<any> {
    if (!(interaction instanceof ButtonInteraction)) return
    if (!interaction.guild) return

    const delta = interaction.customId === 'playback-cpanel-increase-volume' ? 3 : -3

    const resultVolume = clamp(guild.volume + delta, 0, 200)
    await db.query(queries.updateVolume, [resultVolume, interaction.guild.id])
    guild.changeVolume(resultVolume)

    await interaction.deferUpdate()
}

export default {
    interactionIds: ['playback-cpanel-reduce-volume', 'playback-cpanel-increase-volume'],
    handler
}
