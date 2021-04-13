const fs = require('fs')
const path = require('path')

module.exports = {
    init: fs.readFileSync(path.resolve(__dirname, 'init.sql')).toString()
}
