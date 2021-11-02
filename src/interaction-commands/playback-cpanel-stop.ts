import { ButtonInteraction, Client } from 'discord.js'

async function handler (this: Client, { interaction, guild }: InteractionHandlerParams) {
    if (guild.isPlaying) {
        return guild.stop()
    }

    console.log('stop')

    if (interaction instanceof ButtonInteraction) {
        return await interaction.deleteReply()
    }
}

export default {
    interactionIds: ['playback-cpanel-stop'],
    handler
}
