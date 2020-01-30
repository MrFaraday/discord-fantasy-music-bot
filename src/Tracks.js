// Выдача треков

// Конфигурация
const list = require("../config/tracks.config.json");

// Класс выдачи списка треков
module.exports = {
  getTheme: function getTheme(key) {
    switch (key) {
      case "1":
        return list.peaceful;
      case "2":
        return list.combat;
      case "3":
        return list.dungeon;
      case "4":
        return list.city;
      case "5":
        return list.boss;
      case "6":
        return list.mystery;
      case "7":
        return list.tavern;
      default:
        throw "Wrong theme key.";
    }
  }
}
