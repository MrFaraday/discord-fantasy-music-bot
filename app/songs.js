// Выдача треков

// Конфигурация
const cfg = require("./config/songs.config.json");

// Класс выдачи списка треков
module.exports = class Songs {
  constructor() {
    var type;

    var combat;
    var peacefull;

    this.type = cfg.type;
    this.combat = cfg.combat;
    this.peacefull = cfg.peacefull;
  }

  getCombat() {
    var tracks;
    tracks = [];

    for (var i = 0; i < this.combat.length; i++) {
      tracks.push(this.combat[i]);
    }

    return tracks;
  }

  getPeacefull() {
    var tracks;
    tracks = [];

    for (var i = 0; i < this.peacefull.length; i++) {
      tracks.push(this.peacefull[i]);
    }

    return tracks;
  }
}
