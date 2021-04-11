# Discord Fantasy Musicbot

That music bot is designed to quick switching music while playing fantasy board game (such as DnD or Pathfinder). I make it especially for using by GM(DM) to quick switching playlists between themes: exploring, combat, city etc.

Now we're playing with it and it play music mainly from Witcher games. Of course you can change that lists as you wish.

If you interested to use it but need more tracks or function to use custom lists, you can text me.

## Requirements

If you want to use it make sure you have FFMPEG on your machine or add it to remote server.

## Usage

You can invate my bot to test it and may be use it ;) [Draggy - Fantasy Musicbot](https://discordapp.com/oauth2/authorize?client_id=667765780863254558&permissions=3147776&scope=bot)

Clone repository, next create application and bot on discord developer site. Create `.env` file in the root, copy bot API token and write the line in `.env` file like `TOKEN=<your token>`. In `src/config/tracks.config.json` file contain url list of playlists.

Next start application by command:

```sh
npm run start
```

Or you can start dev server:

```sh
node run dev
```

Then copy invite link to browser and choose the guild. When bot get command to play it automatically join to your voice channel. Commands:

-   `hello` greetings
-   `help` list of commands
-   `p [url]` play(or add to queue) track or tracks
-   `fp [url]` play track or list immediately
-   `n` skip curent track
-   `s` stop playing
-   `v [value]` change volume, 5 - default, after 50 may have distortion
-   `prefix [value]` set new prefix for commands, enter `none` to remove it
-   `save [0..9] [url] [name?]\` — bind url to slot, field name is optional, type without spaces

Supported sources:

- Playlists from youtube
- Video from youtube

It can add to queue videos from playlists by sending link to it with `p` or `fp` command. Make sure playlist are unlisted or public. Playing may stuck if it bump into deleted video or video with limitations.

To paly themes immediately I've binded it to `1`,`2`, ... , `7` commands. It's easy to switch on numpad, Peace - first column, Combat - second and Tension - third, where:

-   `1` - peaceful music for exploering
-   `4` - city theme
-   `7` - tavern theme
-   `2` - common combat music
-   `5` - boss fight theme
-   `3` - dungeon exploering music
-   `6` - mysterious music
