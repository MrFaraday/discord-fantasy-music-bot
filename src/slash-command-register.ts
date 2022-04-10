import { REST } from '@discordjs/rest'
import {
    /* RESTPostAPIApplicationCommandsJSONBody, */ Routes
} from 'discord-api-types/v9'
import { clientMessageCommands } from './client-message-commands'
import { assert } from './utils/assertion'
// import { SlashCommandBuilder } from '@discordjs/builders'

// const configs: RESTPostAPIApplicationCommandsJSONBody[] = []
// const configs: SlashCommandBuilder[] = []

// for (const command of commands) {
//     configs.push(command.slashConfig)
// }

export async function registerSlashCommands (token: string) {
    const rest = new REST({ version: '9' }).setToken(token)

    try {
        console.log('Started refreshing application (/) commands.')

        assert(process.env.TEST_GUILD_ID)
        assert(process.env.TEST_CLIENT_ID)

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.TEST_CLIENT_ID,
                process.env.TEST_GUILD_ID
            ),
            {
                body: clientMessageCommands.map((c) => c.slashConfig)
            }
        )

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
}
