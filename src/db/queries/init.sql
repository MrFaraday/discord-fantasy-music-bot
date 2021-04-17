CREATE TABLE IF NOT EXISTS guild (
    id varchar(255) NOT NULL,
    command_prefix varchar(7) NOT NULL,
    volume smallint NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS slot (
    id SERIAL,
    guild_id varchar(255) NOT NULL,
    slot_number smallint NOT NULL,
    value varchar(511) NOT NULL,
    name varchar(63),

    PRIMARY KEY (id),
    CONSTRAINT fk_guild
        FOREIGN KEY(guild_id)
	    REFERENCES guild(id)
);
