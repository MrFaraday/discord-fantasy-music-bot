interface HandlerParams {
    message: import('discord.js').Message;
    guild: import('../guild-session');
    args?: string[];
}

type MessageHandler = (
    this: import('discord.js').Client,
    params: HandlerParams
) => Promise<void | Message>;

type GuildId = string;
type Stream = string | import('discord.js').VoiceBroadcast | import('stream').Readable;

interface Track {
    title: string;
    getStream(): Promise<Stream>;
    meta?: [string, string][];
}

type Slots = Map<number, { name?: string; value: string }>;
