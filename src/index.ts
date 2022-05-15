import { fireClient } from './client'
import { TOKEN } from './config'
import db from './db'
import queries from './db/queries'
import { concatMessages, LogLevel } from './journal'
import { registerSlashCommands } from './slash-command-register'
import { assert } from './utils/assertion'

process.on('unhandledRejection', (error) => {
    console.log(concatMessages(`${LogLevel.ERROR} Unhandled promise rejection:\n`, error))
})

async function startup () {
    assert(TOKEN, 'Environment variable TOKEN not found')

    await db.query(queries.init)
    await registerSlashCommands()

    await fireClient()
}

void startup()
