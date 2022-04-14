import { Client, Interaction } from 'discord.js'
import { interactionCommands } from '../commands'
import { getGuildSession } from '../guild-sessions'
import { assert } from '../utils/assertion'

export default async function interactionCreateHandler (
    this: Client,
    interaction: Interaction
): Promise<void> {
    if (!interaction.isButton()) return
    if (!interaction.guild) return

    const guild = await getGuildSession(this, interaction.guild)

    try {
        const command = interactionCommands.find((c) =>
            c.commandInteractionNames.includes(interaction.customId)
        )

        assert(command, 'Command not found, id: ' + interaction.customId)

        await command.interactionHandler.call(this, { guild, interaction })
    } catch (error) {
        console.error('>> interactionCreateHandler | Error:', '\n', error)
    }

    // await interaction.deferUpdate()
}
