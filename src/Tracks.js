// Выдача треков

// Конфигурация
const cfg = require("../config/tracks.config.json");

// Класс выдачи списка треков
module.exports = {
  getPeaceful: function getPeaceful() {
    return cfg.peaceful;
  },

  getCombat: function getCombat() {
    return cfg.combat;
  },

  getDungeon: function getDungeon() {
    return cfg.dungeon;
  },

  getMystery: function getMystery() {
    return cfg.mystery;
  },

  getCity: function getCity() {
    return cfg.city;
  },

  getTavern: function getTavern() {
    return cfg.tavern;
  },

  getBoss: function getBoss() {
    return cfg.boss;
  }
}
