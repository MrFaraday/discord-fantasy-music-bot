const listRegex = /[&?]list=([^&]+)/i

const getListId = (url) => {
    return url.match(listRegex)[1]
}

const checkUrl = (url) => {}

const buildPlayLink = (id) => 'https://www.youtube.com/watch?v=' + id

module.exports = { getListId, buildPlayLink }
