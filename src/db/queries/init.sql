CREATE TABLE IF NOT EXISTS guilds (
    guild_id varchar(255) NOT NULL,
    command_prefix varchar(7) NOT NULL,
    volume smallint NOT NULL,

    PRIMARY KEY (guild_id)
);

CREATE TABLE IF NOT EXISTS slots (
    id SERIAL,
    guild_id varchar(255) NOT NULL,
    slot smallint NOT NULL,
    value varchar(511) NOT NULL,
    name varchar(63),

    PRIMARY KEY (id),
    CONSTRAINT fk_guild
      FOREIGN KEY(guild_id)
	  REFERENCES guilds(guild_id)
);
