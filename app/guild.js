// Данные сервера

// Модули
const ytdl = require("ytdl-core");

// Array shuffling prototype
Array.prototype.shuffle = function() {
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
};

// Затухание громкости
function fadeOut(dispatcher) {
  if (dispatcher.volume <= 0) {
    dispatcher.end();
    return;
  }
  dispatcher.setVolume(dispatcher.volume - 0.01);
  setTimeout(fadeOut, 40, dispatcher);
}

// Класс данных сервера
module.exports = class Guild {
  constructor(guild) {
    var guild;  // Объект сервера Discord
    var queue;  // Очередь треков
    var connection;  // Объект соеденения с голосовым каналом
    var dispatcher;  // Диспетчер воспроизведения
    var volume;

    this.queue = [];
    this.guild = guild;
    this.volume = 0.5;
  }
  // Проигрывание музыки
  // track - ссылка на youtube
  // channel - объект голосового канала
  play(channel, track) {
    this.queue.push(track);  // Добавление в очередь

    if (!this.guild.voiceConnection) {
      channel.join().then(connection => {
        this.connection = connection;
        this.newDispatcher();
      });
    } else if (!this.dispatcher) {
      this.newDispatcher();
    }
  }
  // Мнгновенное воспроизведение
  // tracks - массив ссылок на youtube
  // channel - объект голосового канала
  forcePlay(channel, tracks) {
    this.queue = [];  // Очистка очереди
    for (const track of tracks) this.queue.push(track);  // Создание новой очереди
    this.queue.shuffle();  // Shuffling

    if (!this.guild.voiceConnection) {
      channel.join().then(connection => {
        this.connection = connection;
        this.newDispatcher();
      });
    } else if (this.dispatcher) {
      fadeOut(this.dispatcher);
    } else {
      this.newDispatcher();
    }
  }
  // Создание диспетчера и обработчиков
  newDispatcher() {
    /* НАЧАЛО */

    this.dispatcher = this.connection.playStream(ytdl(this.queue[0], {filter: "audioonly"}), {volume: this.volume});
    this.queue.shift();

    // Конец трека
    this.dispatcher.on("end", () => {
      this.dispatcher = null;
      if (this.queue[0]) this.newDispatcher();
    });

    /* КОНЕЦ */
  }
  // Пропуск трека
  skip() {
    if (!this.dispatcher) return 0;
    this.dispatcher.end();

    return 1;
  }
  // Остановка
  stop() {
    if (!this.dispatcher) return 0;

    this.queue = [];
    this.dispatcher.end();

    return 1;
  }
}
