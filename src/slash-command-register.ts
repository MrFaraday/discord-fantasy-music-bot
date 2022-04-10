import { REST } from '@discordjs/rest'
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9'
import MessageCommand from './message-command'
import * as MessageCommands from './message-commands'
import { assert } from './utils/assertion'

const configs: RESTPostAPIApplicationCommandsJSONBody[] = []
const commands: MessageCommand[] = Object.values(MessageCommands)
commands.sort((a, b) => a?.sort - b?.sort)

for (const command of commands) {
    configs.push(command.slashConfig.toJSON())
}

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
                body: commands
            }
        )

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
}
