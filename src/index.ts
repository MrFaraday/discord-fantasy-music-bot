import { fireClient } from './client'
import { TOKEN } from './config'
import db from './db'
import queries from './db/queries'
import { registerSlashCommands } from './slash-command-register'
import { assert } from './utils/assertion'

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error)
})

async function startup () {
    try {
        assert(TOKEN, 'Environment variable TOKEN not found')

        await db.query(queries.init)
        await registerSlashCommands(TOKEN)
        await fireClient()
    } catch (error) {
        console.error('Stratup error')
        console.error(error)
    }
}

void startup()
