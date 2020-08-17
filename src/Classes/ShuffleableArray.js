// Shuffleable array class

class ShuffleableArray extends Array {
    /**
     * Shuffle array
     * @returns { this }
     */
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
