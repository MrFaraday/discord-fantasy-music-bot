# Discord Fantasy Music Bot

This music bot designed for playing along with tabletop RPG (such as DnD or Pathfinder) or other board games. I make it especially for using by GM(DM) to quick switching between differnt playlists or tracks. But you can use it as regular music bot.

#### Features

- High performance
- Quick slots for tracks/playlists
- Smooth playing
- End ¯ \\\_(ツ)_/¯

Text me if you interested to use it but have questions or suggestions for better experience.

## Usage

Bot invite link: [Draggy - Fantasy Musicbot](https://discordapp.com/oauth2/authorize?client_id=667765780863254558&permissions=3147776&scope=bot)

Copy invite link to browser and choose the guild. When bot get command to play it automatically join to your voice channel. If you set prefix, add it before command, e.g. `!help`, `#s`

#### Commands

-   `help` list of commands
-   `[0..9]` play saved tracks immediately, if it's list — shuffle it
-   `p [url]` play track(list) or add to queue
-   `fp [url]` same but clear queue before
-   `n` skip curent track
-   `s` stop playing, clear queue
-   `v [value]` set volume, default `5`
-   `d` disconnect from voice channel
-   `save [0..9] [url] [name?]\` bind url to slot, field name is optional, type without spaces
-   `prefix [value]` set prefix for commands, enter `none` to remove it
-   `hello` greetings

#### Supported sources

-   Playlists from youtube
-   Video from youtube

> Make sure playlists are unlisted or public. Playing may stuck if it bump into deleted video or video with limitations.

>If you lost your prefix just use universal `Draggy! [command]`

## Contributing

If you want to use it make sure you have FFMPEG on your machine.

Clone repository, next create application and bot on discord developer site. Create `.env` file in the root, copy bot API token and write the line in `.env` file like `TOKEN=<your token>`. Also create API key at [Google Cloud Platform](https://console.cloud.google.com/apis/) and add `YOUTUBE_API_KEY=<API key>`

Next start application by command:

```sh
npm run start
```

Or start dev server:

```sh
node run dev
```

## Credits

Thanks to [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](www.flaticon.com) for bot avatar!
