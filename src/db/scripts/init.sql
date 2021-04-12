CREATE TABLE IF NOT EXISTS guilds (
    guild_id varchar(255) NOT NULL,
    prefix varchar(7),

    PRIMARY KEY (guild_id)
);

CREATE TABLE IF NOT EXISTS slots (
    id SERIAL,
    guild_id varchar(255) NOT NULL,
    slot smallint NOT NULL,
    url VARCHAR(511) NOT NULL,
    name VARCHAR(63),

    PRIMARY KEY (id),
    CONSTRAINT fk_guild
      FOREIGN KEY(guild_id) 
	  REFERENCES guilds(guild_id)
);
