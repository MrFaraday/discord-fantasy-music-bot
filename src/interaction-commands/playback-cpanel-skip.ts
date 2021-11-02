import { ButtonInteraction, Client } from 'discord.js'

async function handler (
    this: Client,
    { interaction, guild }: InteractionHandlerParams
): Promise<any> {
    if (guild.isPlaying) {
        await guild.skip()
    }

    if (interaction instanceof ButtonInteraction) {
        return await interaction.deferUpdate()
    }
}

export default {
    interactionIds: ['playback-cpanel-skip'],
    handler
}
