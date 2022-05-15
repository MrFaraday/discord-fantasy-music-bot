/* eslint-disable */

const ncp = require('ncp').ncp

const options = {
    filter: /.*(?<!.ts|.json)$/
}

ncp('./src', './build', options, (err) => {
    if (err) {
        console.error(err)
        throw err
    }
})
