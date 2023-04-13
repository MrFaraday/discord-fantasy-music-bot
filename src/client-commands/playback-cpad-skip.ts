import { ButtonInteraction, Client } from 'discord.js'
import GuildSession from '../guild-session'

async function interactionHandler (
    this: Client,
    { interaction, guild }: InterationHandlerParams
): Promise<any> {
    if (guild.isPlaying) {
        await guild.skip().catch((err) => console.log('skip', err))
    }

    if (interaction instanceof ButtonInteraction) {
        return await interaction.deferUpdate()
    }
}

interface ExecutorParams {
    changeIt: number
}

async function executor (guild: GuildSession, { changeIt }: ExecutorParams) {
    // executor
}

const command: InteractionCommand<ExecutorParams> = {
    commandInteractionNames: ['playback-cpad-skip'],
    interactionHandler,

    executor
}

export default command
