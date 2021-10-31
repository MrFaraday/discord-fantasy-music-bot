import { Worker } from 'worker_threads'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface YtVideoSearchResult {
    videoId: string
    title: string
    thumbnail: string
}

interface PromiseController {
    uuid: string
    query: string
    resolve(result: YtVideoSearchResult): void
    reject(): void
}

interface ServiceResultSuccess {
    uuid: string
    payload: YtVideoSearchResult
    success: true
}

interface ServiceResultFail {
    uuid: string
    message: string
    success: false
}

const serviceRequests = new Map<string, PromiseController>()
let isOnline = false
let worker: Worker

function spawnWorker () {
    worker = new Worker(path.join(__dirname, 'worker.js'))

    worker.on('online', () => {
        isOnline = true
        console.log('>> YtSearchService | Worker spawned')

        for (const [uuid, { query }] of serviceRequests) {
            worker.postMessage(JSON.stringify([uuid, query]))
        }
    })

    worker.on('message', (m) => {
        const result: ServiceResultSuccess | ServiceResultFail = JSON.parse(m)

        const uuid: string = result?.uuid ?? ''
        const success: boolean = result?.success ?? false
        const data: YtVideoSearchResult | undefined = result?.payload
        const message: string | undefined = result?.message

        const request = serviceRequests.get(uuid)

        if (!request) {
            return console.error(
                '>> YtSearchService | onMessage: request not found',
                '\n',
                message
            )
        }

        try {
            if (success) {
                assert(uuid, data)
                request.resolve(data)
            } else {
                request.reject(message)
            }
        } catch (error) {
            console.error('>> YtSearchService | onWorkerMessage:', error)
        } finally {
            serviceRequests.delete(uuid)
        }
    })

    worker.on('error', (error) => {
        console.error('>> YtSearchService | onWorkerError', '\n', error)
    })
    worker.on('exit', (code) => {
        console.error('>> YtSearchService |', `stopped with ${code} exit code`)

        isOnline = false
        spawnWorker()
    })
}

function search (query: string): Promise<YtVideoSearchResult> {
    return new Promise((resolve, reject) => {
        const serviceRequest = { uuid: uuidv4(), query, resolve, reject }

        serviceRequests.set(serviceRequest.uuid, serviceRequest)

        if (isOnline) {
            worker.postMessage(JSON.stringify([serviceRequest.uuid, query]))
        }
    })
}

function assert (uuid: string, data: YtVideoSearchResult): void {
    if (typeof uuid !== 'string') {
        throw new TypeError('Invalide uuid type')
    }
    if (!data || !data.videoId || !data.title || !data.thumbnail) {
        throw new TypeError('Invalide YtVideoSearchResult data format')
    }
}

spawnWorker()

const YtSearchService = { search }
export default YtSearchService
