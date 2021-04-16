import { ClientBase, Pool, PoolClient, Query, QueryResult } from 'pg'
import { DATABASE_URL } from '../config'

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

export async function query<T> (text: string, params?: string[]): Promise<QueryResult<T>> {
    const start = Date.now()
    const res = await pool.query(text, params)

    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })

    return res
}

interface DbClient {
    query(): any
    release(): any
    poolClient: PoolClient
}

export async function getClient (): Promise<DbClient> {
    const client = await pool.connect()
    let lastQuery: any[]

    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!')
        console.error(`The last executed query on this client was: ${lastQuery}`)
    }, 5000)

    return {
        query (...args: any[]): any {
            lastQuery = args
            return client.query(...args)
        },

        release (): void {
            clearTimeout(timeout)
            return client.release()
        },

        poolClient: client
    }
}

const db = { query, getClient }
export default db
