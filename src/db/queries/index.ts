import fs from 'fs'
import path from 'path'

export default Object.freeze({
    init: fs.readFileSync(path.resolve(__dirname, 'init.sql')).toString(),

    updateVolume: 'UPDATE guild SET volume = $1 WHERE id = $2'
})
