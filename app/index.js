/* Загрузка конфигурации:
 * cfg.prefix - Префикс для команд в текством канале
 * cfg.token - Токен бота
 */
let cfg = require("./config/bot.config.json");

// Основные модули
const Discord = require('discord.js');

const Guild = require("./guild.js");  // Класс данных сервера
const Songs = require("./songs.js");  // Получение списка треков

const PREFIX = cfg.prefix;
const TOKEN = cfg.token;

var guilds = {};
const bot = new Discord.Client();
const songs = new Songs();

// Обработчик сообщений
bot.on('message', message => {
  let args = message.content.substring(PREFIX.length).split(' ');

  switch (args[0]) {
    case "hello": {
      message.channel.send('Привет :)');

      break;
    }
    // Страндартная команда
    case "play": {
      if (!message.member.voiceChannel) {
        message.channel.send('Ты не на канале...');
        break;
      }
      if (!guilds[message.guild.id]) guilds[message.guild.id] = new Guild(message.guild);
      var guild = guilds[message.guild.id];
      guild.play(message.member.voiceChannel, args[1]);

      break;
    }
    // Peacefull music
    case "p": {
      if (!message.member.voiceChannel) {
        message.channel.send('Ты не на канале...');
        break;
      }

      if (!guilds[message.guild.id]) guilds[message.guild.id] = new Guild(message.guild);
      var guild = guilds[message.guild.id];
      guild.forcePlay(message.member.voiceChannel, songs.getPeacefull());

      break;
    }
    // Combat music
    case "c": {
      if (!message.member.voiceChannel) {
        message.channel.send('Ты не на канале...');
        break;
      }

      if (!guilds[message.guild.id]) guilds[message.guild.id] = new Guild(message.guild);
      var guild = guilds[message.guild.id];
      guild.forcePlay(message.member.voiceChannel, songs.getCombat());

      break;
    }
    // Пропуск
    case "skip": {
      if (!guilds[message.guild.id]) {
        message.channel.send('Я здесь ещё ничего не играл :(');
        break;
      }

      var guild = guilds[message.guild.id];
      if (!guild.skip()) message.channel.send('Нечего пропускать');

      break;
    }
    // Остановка
    case "stop": {
      if (!guilds[message.guild.id]) {
        message.channel.send('Я здесь ещё ничего не играл :(');
        break;
      }

      var guild = guilds[message.guild.id];
      if (!guild.stop()) message.channel.send('Нечего останавливать');

      break;
    }
    default:
      break;
  }
});

bot.on("ready", () => {
  console.log(`Запустился бот ${bot.user.username}!`);
  // client.generateInvite([3147776]).then(link => {
  //   console.log(link);
  // });
});

bot.login(TOKEN);
