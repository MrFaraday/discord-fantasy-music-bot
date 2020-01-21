// Effects.js

module.exports = {
  // Затухание громкости
  fadeOut: function fadeOut(dispatcher) {
    if (dispatcher.volume <= 0) {
      dispatcher.end();
      return;
    }
    dispatcher.setVolume(dispatcher.volume - 0.005);
    setTimeout(fadeOut, 40, dispatcher);
  }
}
