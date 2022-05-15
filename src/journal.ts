import { NODE_ENV } from './config'
import db from './db'

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

export const concatMessages = (...messages: unknown[]): string =>
    messages.reduce((acc, message) => {
        if (message instanceof Error)
            return `${String(acc)} ${message.stack ?? message.message}`
        else return `${String(acc)} ${String(message)}`
    }, '') as string

export class GuildJournal {
    guildId: string

    constructor (guildId: string) {
        this.guildId = guildId
    }

    log (...messages: unknown[]) {
        const message = concatMessages(...messages)

        if (NODE_ENV === 'development') {
            console.log(`[${LogLevel.INFO}] ` + message)
        }

        void db
            .query(
                'INSERT INTO guild_log (guild_id, message, level) VALUES ($1, $2, $3)',
                [this.guildId, message, LogLevel.INFO]
            )
            .catch((err) => console.log(concatMessages('Logger error\n', err)))
    }

    warn (...messages: unknown[]) {
        const message = concatMessages(...messages)

        if (NODE_ENV === 'development') {
            console.log(`[${LogLevel.WARN}] ` + message)
        }

        void db
            .query(
                'INSERT INTO guild_log (guild_id, message, level) VALUES ($1, $2, $3)',
                [this.guildId, message, LogLevel.WARN]
            )
            .catch((err) => console.log(concatMessages('Logger error\n', err)))
    }

    error (...messages: unknown[]) {
        const message =
            concatMessages(...messages) +
            '\n\nStacktrace:\n' +
            (Error().stack?.split('\n').slice(2).join('\n') ?? 'no stacktrace')

        if (NODE_ENV === 'development') {
            console.log(`[${LogLevel.ERROR}] ` + message)
        }

        void db
            .query(
                'INSERT INTO guild_log (guild_id, message, level) VALUES ($1, $2, $3)',
                [this.guildId, message, LogLevel.ERROR]
            )
            .catch((err) => console.log(concatMessages('Logger error\n', err)))
    }

    debug (...messages: unknown[]) {
        const message = concatMessages(...messages)

        if (NODE_ENV !== 'development') return

        console.log(`[${LogLevel.DEBUG}] ` + message)

        void db
            .query(
                'INSERT INTO guild_log (guild_id, message, level) VALUES ($1, $2, $3)',
                [this.guildId, message, LogLevel.DEBUG]
            )
            .catch((err) => console.log(concatMessages('Logger error\n', err)))
    }
}
