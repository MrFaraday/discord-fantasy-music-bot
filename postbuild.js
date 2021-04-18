const ncp = require('ncp').ncp

const options = {
    filter: /.*(?<!.ts|.json)$/
}

ncp('./src', './build', options, function (err) {
    if (err) {
        return console.error(err)
    }
})
