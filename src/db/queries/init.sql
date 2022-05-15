CREATE TABLE IF NOT EXISTS guild (
    id varchar(255) NOT NULL,
    command_prefix varchar(10) NOT NULL,
    volume smallint NOT NULL,
    was_active_at timestamp NOT NULL DEFAULT now(),

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS bind (
    id SERIAL,
    guild_id varchar(255) NOT NULL,
    bind_key smallint NOT NULL,
    bind_value varchar(500) NOT NULL,
    bind_name varchar(80),

    PRIMARY KEY (id),
    CONSTRAINT fk_guild
        FOREIGN KEY(guild_id)
	    REFERENCES guild(id)
);

CREATE TABLE IF NOT EXISTS guild_log (
    id SERIAL,
    guild_id varchar(255) NOT NULL,
    level varchar(10) NOT NULL,
    message text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),

    PRIMARY KEY (id),
    CONSTRAINT fk_guild
        FOREIGN KEY(guild_id)
        REFERENCES guild(id)
);
