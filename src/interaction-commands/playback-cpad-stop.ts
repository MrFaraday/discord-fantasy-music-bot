import { ButtonInteraction, Client } from 'discord.js'

async function handler (
    this: Client,
    { interaction, guild }: InteractionHandlerParams
): Promise<any> {
    if (guild.isPlaying) {
        await guild.stop()
    }

    if (interaction instanceof ButtonInteraction) {
        return await interaction.deferUpdate()
    }
}

export default {
    interactionIds: ['playback-cpad-stop'],
    handler
}
