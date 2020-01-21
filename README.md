# Discord Fantasy Music Bot

That music bot is designed to quick switching music while playing fantasy board game (such as DnD or Pathfinder). I make it especially for using by GM(DM) to quick switching playlists between exploring, combat, city etc. themes.

I still develop it to greater stability and functionality. I'm plannig in future this bot will play music mainly from The Wither games. Of course you can change that lists as you wish.

Sorry for comments and bot messages are mainly in russian, but if need help to translate it just text me.

## Requirements

If you want to use it make sure you have FFMPEG on your machine.

## Usage

Clone repository, next create application and bot on discord developer site. Copy bot token and insert it to `token` field of `config/bot.config.json` file, also there you can set the prefix for bot commands. In `config/tracks.config.json` contain list of tracks splited by categories. Futher start application by command:

```sh
$ npm run start
```
or
```sh
$ node index.js
```

Then copy invite link to browser and choose the guild. When bot get command to play it automatically join to your voice channel. Commands:
* `p [url]` play(or add to queue) video from YouTube;
* `n` skip curent track;
* `s` stop playing;
* `v [int]` change volume in range *0 - inf*, 5 - normal level.

To paly themes I've binded it to `1`,`2`, ... , `7` commands. It's easy to switch on numpad, Peace - first column, Combat - second and Tension - third., where:

* `1` - peaceful music for exploering;
* `4` - city theme;
* `7` - tavern theme;
* `2` - common combat music;
* `5` - boss fight theme;
* `3` - dungeon exploering music;
* `6` - mysterious music.
