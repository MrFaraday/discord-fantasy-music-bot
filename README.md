# Discord Fantasy Music Bot

This music bot designed for playing along with tabletop RPG (such as DnD or Pathfinder) or other board games. I make it especially for using by GM(DM) to quick switching between differnt playlists or tracks. But you can use it as regular music bot.

#### Features

- High performance
- Quick slots for tracks/playlists
- Smooth playing

Text me if you interested to use it but have questions or suggestions for better experience.

## Usage

Bot invite link: [Shyrlonay - Fantasy Musicbot](https://discord.com/api/oauth2/authorize?client_id=667765780863254558&permissions=3147840&scope=bot)

Open link in a browser and choose the guild. When bot get command to play it automatically join to your voice channel. If you set prefix, add it right before command, e.g. `!help`, `#s`

#### Commands

-   `p [url]` play track(playlist) from URL or add to queue
-   `fp [url]` same but clear queue before
-   `[0..9]` play saved tracks immediately, if it's list — shuffle it
-   `help` list of commands
-   `n` skip curent track
-   `s` stop playing and clear queue
-   `v [0..200?]` display or set volume
-   `d` disconnect from voice channel
-   `save [0..9] [url] [name?]` bind url to slot, field name is optional, type name without spaces
-   `prefix [value]` set prefix for commands, enter *none* to remove it

#### Supported sources

-   Playlists from youtube
-   Video from youtube

> Make sure playlists are unlisted or public. There is possibility that playing may stuck if it bump into deleted video or video with limitations.

> If you lost your prefix just use universal `Shyrlonay! [command]`

## Contributing

##### Requirements

- Discord Application at [Developer Portal](https://discord.com/developers/applications)
- [FFMPEG](https://ffmpeg.org/)
- YouTube API key at [Google Cloud Platform](https://console.cloud.google.com/apis/)
- PostgreSQL database

##### .env file keys

```ini
TOKEN= ...                # bot api token at developer portal
YOUTUBE_API_KEY= ...      # youtube api key
DATABASE_URL= ...         # database url or add other configs like host, username, password
```

Stratup application:

```sh
npm run start
```

Or start dev server:

```sh
node run dev
```

## Credits

Thanks to [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](www.flaticon.com) for bot avatar!
