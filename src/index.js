const { fireApp } = require('./app')
const { query } = require('./db')
const scripts = require('./db/scripts')

async function startup () {
    try {
        await query(scripts.init)

        // await fireApp()
    } catch (error) {
        console.error('Stratup error')
        console.error(error)
    }
}

startup()
