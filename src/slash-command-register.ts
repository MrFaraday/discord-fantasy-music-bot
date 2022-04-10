import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { clientMessageCommands } from './client-message-commands'

const data = clientMessageCommands.map((c) => {
    const name = c.slashConfig.name
    console.log(`Validating slash command: ${name}`)

    return c.slashConfig.toJSON()
})

export async function registerSlashCommands (token: string) {
    const rest = new REST({ version: '9' }).setToken(token)

    try {
        console.log('Started refreshing application (/) commands.')

        await rest.put(Routes.applicationCommands('831294296388927539'), {
            body: data
        })

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
        console.log('Reloading application (/) commands failed.')
    }
}
