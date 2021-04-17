import { Pool, PoolClient, QueryResult } from 'pg'
import { DATABASE_URL } from '../config'

type Value = string | number | null

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

async function query<T> (text: string, params?: Value[]): Promise<QueryResult<T>> {
    const start = Date.now()
    const res = await pool.query(text, params)

    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })

    return res
}

export class DbClient {
    private poolClient: PoolClient
    private lastQuery: { text?: string; params?: Value[] }
    private timeout: NodeJS.Timeout

    constructor (poolClient: PoolClient) {
        this.poolClient = poolClient
        this.lastQuery = {}
        this.timeout = setTimeout(() => {
            console.error('A client has been checked out for more than 5 seconds!')
            console.error('The last executed query on this client was:')
            console.error(this.lastQuery)
        }, 5000)
    }

    query<T> (text: string, params?: Value[]): Promise<QueryResult<T>> {
        this.lastQuery = { text, params }
        return this.poolClient.query<T>(text, params)
    }

    release (): void {
        clearTimeout(this.timeout)
        return this.poolClient.release()
    }
}

async function getClient (): Promise<DbClient> {
    const poolClient = await pool.connect()
    return new DbClient(poolClient)
}

const db = { query, getClient }

export default db
