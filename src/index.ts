import { fireApp } from './app'
import { query } from './db'
import queries from './db/queries'

async function startup () {
    try {
        await query(queries.init)

        await fireApp()
    } catch (error) {
        console.error('Stratup error')
        console.error(error)
    }
}

void startup()
