import { Client, Interaction } from 'discord.js'
import { interactionCommands } from '../commands'
import { getGuildSession } from '../guild-sessions'
import { assert } from '../utils/assertion'

export default async function interactionCreateHandler (
    this: Client,
    interaction: Interaction
): Promise<void> {
    if (!interaction.guild) return

    let commandName = ''

    if (interaction.isButton()) {
        commandName = interaction.customId
    } else if (interaction.isCommand()) {
        commandName = interaction.commandName
    } else {
        console.error(
            '>> interactionCreateHandler | unkown interation type: ' + interaction.type
        )
    }

    const guild = await getGuildSession(this, interaction.guild)

    try {
        const command = interactionCommands.find((c) =>
            c.commandInteractionNames.includes(commandName)
        )

        assert(command, 'Command not found, id: ' + commandName)

        await command.interactionHandler.call(this, { guild, interaction })
    } catch (error) {
        console.error('>> interactionCreateHandler | Error:', '\n', error)
    }
}
