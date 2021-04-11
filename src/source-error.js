module.exports = class SourceError {
    /**
     * Message to reply
     * @param { string } message
     */
    constructor (message) {
        this.message = message
    }

    toString () {
        return this.message
    }
}
