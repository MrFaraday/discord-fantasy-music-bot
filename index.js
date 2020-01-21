/* Загрузка конфигурации:
 * cfg.prefix - Префикс для команд в текством канале
 * cfg.token - Токен бота
 */
let cfg = require("./config/bot.config.json");

// Основные модули
const Discord = require('discord.js');

const Guild = require("./src/Guild.js");  // Класс данных сервера
const tracks = require("./src/Tracks.js");  // Выдача списков треков

const PREFIX = cfg.prefix;
const TOKEN = cfg.token;

var guilds = {};
const bot = new Discord.Client();

function pullThemeFunc(key) {
  switch (key) {
    case "1":
      return tracks.getPeaceful;
    case "2":
      return tracks.getCombat;
    case "3":
      return tracks.getDungeon;
    case "4":
      return tracks.getCity;
    case "5":
      return tracks.getBoss;
    case "6":
      return tracks.getMystery;
    case "7":
      return tracks.getTavern;
    default:
      throw "Wrong theme key.";
  }
}

// Обработчик сообщений
bot.on('message', message => {
  let args = message.content.substring(PREFIX.length).split(' ');

  switch (args[0]) {
    case "hello": {
      message.channel.send('Привет :)');

      break;
    }
    // Страндартная команда проигрывания или добавления в очередь
    case "p": {
      if (!message.member.voiceChannel) {
        message.channel.send('Ты не на канале...');
        break;
      }
      if (!guilds[message.guild.id]) guilds[message.guild.id] = new Guild(message.guild);
      var guild = guilds[message.guild.id];
      guild.play(message.member.voiceChannel, args[1]);

      break;
    }
    // Peaceful music
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7": {
      if (args[1]) break;
      if (!message.member.voiceChannel) {
        message.channel.send('Ты не на канале...');
        break;
      }

      if (!guilds[message.guild.id]) guilds[message.guild.id] = new Guild(message.guild);
      var guild = guilds[message.guild.id];
      guild.forcePlay(
        message.member.voiceChannel,
        (pullThemeFunc(args[0]))()
      );

      break;
    }
    // Пропуск
    case "n": {
      if (!guilds[message.guild.id]) {
        message.channel.send('Я здесь ещё ничего не играл :(');
        break;
      }

      var guild = guilds[message.guild.id];
      if (!guild.skip()) message.channel.send('Нечего пропускать');

      break;
    }
    // Остановка
    case "s": {
      if (!guilds[message.guild.id]) {
        message.channel.send('Я здесь ещё ничего не играл :(');
        break;
      }

      var guild = guilds[message.guild.id];
      if (!guild.stop()) message.channel.send('Нечего останавливать');

      break;
    }
    // Громкось
    case "v": {
      if (!args[1]) {
        message.channel.send('Укажи громкость, 5 - обычная');
        break;
      }
      if (parseInt(args[1]) == NaN) {
        message.channel.send("Это не число...");
        break;
      }

      if (!guilds[message.guild.id]) break;

      var guild = guilds[message.guild.id];
      guild.volumeChange(parseInt(args[1]));

      break;
    }
    default:
      break;
  }
});

bot.on("ready", () => {
  console.log(`Запустился бот ${bot.user.username}!`);
  bot.generateInvite([3147776]).then(link => {
    console.log("Link to invite bot to server:");
    console.log(link);
  });
});

bot.login(TOKEN);
