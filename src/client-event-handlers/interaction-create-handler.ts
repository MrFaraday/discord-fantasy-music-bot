import { Client, Interaction } from 'discord.js'
import { getGuildSession } from '../guild-sessions'
import * as InteractionCommands from '../interaction-commands'
import { assert } from '../utils/assertion'

const commands: InteractionCommand[] = []
Object.values(InteractionCommands).map((cmd) => {
    commands.push(cmd)
})

export default async function interactionCreateHandler (
    this: Client,
    interaction: Interaction
): Promise<void> {
    if (!interaction.isButton()) return
    if (!interaction.guild) return

    const guild = await getGuildSession(this, interaction.guild)

    try {
        const command = commands.find((c) =>
            c.interactionIds.includes(interaction.customId)
        )

        assert(command, 'Command not found, id: ' + interaction.customId)

        await command.handler.call(this, { guild, interaction })
    } catch (error) {
        console.error('>> interactionCreateHandler | Error:', '\n', error)
    }

    // await interaction.deferUpdate()
}
