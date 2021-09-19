import express from 'express'
import yts from 'yt-search'

const server = express()

server.get('/search', async (req, res) => {
    try {
        const query = req.query.q

        if (!query || typeof query !== 'string') {
            return res.sendStatus(400)
        }

        const data = await yts({ query, pages: 1 })
        res.json(data)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

server.listen(3333, () => {
    console.log('YT search api started')
})
