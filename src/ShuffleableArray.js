// Shuffleable array

module.exports = class ShuffleableArray extends Array {
  shuffle() {
    var counter = this.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      index = (Math.random() * counter--) | 0;

      // And swap the last element with it
      temp = this[counter];
      this[counter] = this[index];
      this[index] = temp;
    }
  }
}
