import { REST } from '@discordjs/rest'
import assert from 'assert'
import { Routes } from 'discord-api-types/v9'
import { slashCommands } from './commands'
import { TEST_SERVER_ID, TOKEN } from './config'
import { concatMessages, LogLevel } from './journal'
import { assertType } from './utils/assertion'

const data = slashCommands.map((c) => {
    const name = c.slashConfig.name
    console.log(`[${LogLevel.INFO}] Validating slash command: ${name}`)

    return c.slashConfig.toJSON()
})

export async function registerSlashCommands () {
    assert(TOKEN, 'Environment variable TOKEN not found')
    const rest = new REST({ version: '9' }).setToken(TOKEN)

    const application = await rest.get(Routes.user('@me'))
    assertType<{ id: string }>(
        application,
        typeof application === 'object' && application !== null && 'id' in application
    )

    /**
     * @todo remove on release
     */
    if (!TEST_SERVER_ID) {
        return
    }

    if (TEST_SERVER_ID) {
        await registerCommandsLocally(application.id, rest, TEST_SERVER_ID)
    } else {
        await registerCommandsGlobally(application.id, rest)
    }
}

async function registerCommandsGlobally (applicationId: string, rest: REST) {
    try {
        console.log(`[${LogLevel.INFO}] Started refreshing application (/) commands.`)

        await rest.put(Routes.applicationCommands(applicationId), {
            body: data
        })

        console.log(`[${LogLevel.INFO}] Successfully reloaded application (/) commands.`)
    } catch (error) {
        console.log(
            `[${LogLevel.ERROR}] Reloading application (/) commands failed:`,
            '\n',
            concatMessages(error)
        )
    }
}

async function registerCommandsLocally (
    applicationId: string,
    rest: REST,
    guildId: string
) {
    try {
        console.log(
            `[${LogLevel.INFO}] Started refreshing application (/) commands for test enviroment.`
        )

        // const globCommands = await rest.get(Routes.applicationCommands(applicationId))

        // assertType<{ id: string }[]>(globCommands, true)

        // await Promise.all(
        //     globCommands.map((c) =>
        //         rest.delete(Routes.applicationCommand(applicationId, c.id))
        //     )
        // )

        // const localCommands = await rest.get(
        //     Routes.applicationGuildCommands(applicationId, guildId)
        // )

        // assertType<{ id: string }[]>(localCommands, true)

        // await Promise.all(
        //     localCommands.map((c) =>
        //         rest.delete(Routes.applicationGuildCommand(applicationId, guildId, c.id))
        //     )
        // )

        await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
            body: data
        })

        console.log(
            `[${LogLevel.INFO}] Successfully reloaded application (/) commands for test enviroment.`
        )
    } catch (error) {
        console.log(
            `[${LogLevel.ERROR}] Reloading application (/) commands for test enviroment failed:`,
            '\n',
            concatMessages(error)
        )
    }
}
