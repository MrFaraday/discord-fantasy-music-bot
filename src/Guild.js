// Данные сервера

// Модули
const ytdl = require("ytdl-core");  // Загрузчик с youtube
const ShuffleableArray = require("./ShuffleableArray.js");  // Расширенный класс массива
const Effects = require("./Effects.js");  // Эффекты

const BASE_VOLUME = 0.15;  // Базовая громкость

// Класс данных сервера
module.exports = class Guild {
  constructor(guild) {
    console.log(`Connected to guild: ${guild.name}`)
    this.newQueue();  // Создание чистой очереди
    this.guild = guild;  // Объект сервера Discord
    this.volume = BASE_VOLUME;
  }
  // Проигрывание музыки
  // track - ссылка на youtube
  // channel - объект голосового канала
  play(channel, track) {
    this.queue.push(track);  // Добавление в очередь

    if (!this.guild.voiceConnection) {
      this.newVoiceConnection(channel);
    } else if (!this.dispatcher) {
      this.newDispatcher();
    }
  }
  // Мнгновенное воспроизведение
  // tracks - массив ссылок на youtube
  // channel - объект голосового канала
  forcePlay(channel, tracks) {
    this.newQueue();  // Очистка очереди
    for (const track of tracks) this.queue.push(track.url);  // Создание новой очереди
    this.queue.shuffle();  // Shuffling

    if (!this.guild.voiceConnection) {
      this.newVoiceConnection(channel);
    } else if (this.dispatcher) {
      Effects.fadeOut(this.dispatcher);
    } else {
      this.newDispatcher();
    }
  }
  // Создание диспетчера и обработчиков
  newDispatcher() {
    console.log(`New dispatcher: ${this.guild.name}`);
    this.dispatcher = this.connection.playStream(
      ytdl(this.queue[0], {filter: "audioonly"}),
      {volume: this.volume}
    );
    this.queue.shift();

    // Конец трека
    this.dispatcher.on("end", () => {
      if (this.queue[0]) this.newDispatcher();
      else this.dispatcher = null;
    });
  }
  // Подключение к голосовому каналу
  newVoiceConnection(channel) {
    channel.join().then(connection => {
      this.connection = connection;
      this.newDispatcher();

      this.connection.on("disconnect", () => {
        console.log("guild.connection: disconnect event")
        this.dispatcher.end();
        this.newQueue();
        this.connection = null;
      });

      this.connection.on("failed", error => {
        console.log(error);
      });

      this.connection.on("error", error => {
        console.log(error);
      });

      this.connection.on("warn", warn => {
        console.log(warn);
      });
    });
  }
  // Изменение громкости
  volumeChange(volume) {
    this.volume = (BASE_VOLUME / 5) * volume;
    this.dispatcher.setVolume(this.volume);
  }
  // Пропуск трека
  skip() {
    if (!this.dispatcher) return 0;
    Effects.fadeOut(this.dispatcher);

    return 1;
  }
  // Остановка
  stop() {
    if (!this.dispatcher) return 0;
    this.newQueue();
    Effects.fadeOut(this.dispatcher);

    return 1;
  }
  // Очистка очереди
  newQueue() {
    this.queue = new ShuffleableArray();
  }
}
