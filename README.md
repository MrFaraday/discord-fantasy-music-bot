# Discord Fantasy Music Bot

This music bot designed for playing along with tabletop RPG (such as DnD or Pathfinder) or other board games. I make it especially for using by GM(DM) to quick switching between differnt playlists or tracks. But you can use it as regular music bot.

Bot invite link: [Shyrlonay - Fantasy Music Bot](https://discord.com/api/oauth2/authorize?client_id=667765780863254558&permissions=0&scope=bot%20applications.commands)

If you interested to use it but have questions or suggestions for better experience leave an issue at this repository or follow to [Discord Support Server](https://discord.gg/a68EqssbfT).

### Features

-   Tracks and playlists binding
-   Playback control and quick switching between ambient playlists, no more message commands typing  during session

![Tux, the Linux mascot](https://raw.githubusercontent.com/mr-faraday/discord-fantasy-music-bot/master/docs/cpad-demo.jpg)

### Usage

Invite bot to a guild. When bot get command to play it automatically join to your voice channel. Default prefix: `-`, add it right before each command, e.g. `-help`, `-s`.

#### Commands

-   `help [v?]` show list of commands, add **_v_** for more info
-   `p [link]` play track(playlist) from link or add to queue
-   `fp [link]` clear queue and play shuffled playlist or track immediately
-   `[0..15]` play saved tracks immediately, equal to **_fp [saved link]_**
-   `cpad` display control pad
-   `n` skip current track
-   `s` stop playing and clear queue
-   `v [0..200?]` display or set volume
-   `now` display current playing track
-   `d` disconnect from a voice channel
-   `binds` show saved links
-   `bind [0..15] [link] [name?]` bind link to number, rest of input will be name but it optional
-   `drop [0..15]` delete binded link
-   `summon` attract bot to your voice channel while playing or idle
-   `prefix [value]` set prefix for commands, enter **_none_** to remove it

> Max queue size is 50 items.<br>
> During idle it will leave voice channel after 5 minutes automatically.<br>
> Mention bot to use command without prefix: `@Shyrlonay [command]`.

#### Supported sources

-   Playlists from YouTube
-   Video from YouTube

> Make sure playlists are unlisted or public. There is slightest chance that playing may stuck if it bump into deleted video or video with limitations.

### Upcoming

-   `queue` show queue
-   `shuffle` shuffle queue

## Contributing

##### Requirements

-   Discord Application at [Developer Portal](https://discord.com/developers/applications)
-   [FFMPEG](https://ffmpeg.org/)
-   YouTube API key at [Google Cloud Platform](https://console.cloud.google.com/apis/)
-   PostgreSQL database

##### .env file keys

```ini
TOKEN= ...                # bot api token at developer portal
YOUTUBE_API_KEY= ...      # youtube api key
DATABASE_URL= ...         # database url or add other configs like host, username, password
```

Run dev server:

```sh
node run dev
```

## Credits

Thanks to [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com) for bot avatar!
