// Shuffleable array class

/**
 * Shuffleable array class
 * @type { import('../type').ShuffleableArray }
 */
class ShuffleableArray extends Array {
    shuffle() {
        let counter = this.length
        let temp
        let index

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = (Math.random() * counter--) | 0

            // And swap the last element with it
            temp = this[counter]
            this[counter] = this[index]
            this[index] = temp
        }

        return this
    }
}

module.exports = ShuffleableArray
