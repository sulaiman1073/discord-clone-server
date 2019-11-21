CREATE OR REPLACE FUNCTION add_email_verification_token_trigger()
RETURNS TRIGGER AS $BODY$
BEGIN
  INSERT INTO
    email_verification_tokens
    (
      user_id
    )
  VALUES
    (NEW.id);
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

CREATE TRIGGER add_email_verification_token
AFTER INSERT ON users
FOR EACH ROW EXECUTE PROCEDURE add_email_verification_token_trigger();
--
--
--
CREATE OR REPLACE FUNCTION add_default_guild_channel_trigger()
RETURNS TRIGGER AS $BODY$
BEGIN
  INSERT INTO
    channels
    (
      name,
      position,
      guild_id

    )
  VALUES
    ('general', 1, NEW.id);
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

CREATE TRIGGER add_default_guild_channel
AFTER INSERT ON guilds
FOR EACH ROW EXECUTE PROCEDURE add_default_guild_channel_trigger();
--
--
--
CREATE OR REPLACE FUNCTION add_user_discriminator_trigger()
RETURNS TRIGGER AS $BODY$
BEGIN
    NEW.discriminator =
    (
      SELECT
        *
      FROM
      (
        SELECT
          generate_series(0, 9999)
        EXCEPT
        (
          SELECT
            discriminator
          FROM
            users
          WHERE
            users.username = NEW.username
        )
      ) as x
      ORDER BY
        random()
      LIMIT
        1
    );
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

CREATE TRIGGER add_user_discriminator
BEFORE INSERT OR UPDATE OF discriminator ON users
FOR EACH ROW EXECUTE PROCEDURE add_user_discriminator_trigger();
--
--
--
CREATE OR REPLACE FUNCTION user_can_message_trigger()
RETURNS TRIGGER AS $BODY$
BEGIN
IF (
    NOT EXISTS (
      SELECT
        1
      FROM
        channels
      WHERE
        channels.id = NEW.channel_id
        AND EXISTS (
          SELECT
            1
          FROM
            members
          WHERE
            members.user_id = NEW.user_id
            AND members.guild_id = channels.guild_id
        )
     )
) THEN RAISE EXCEPTION 'user must be member of guild to send messages';
END IF;
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

CREATE TRIGGER user_can_message
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE PROCEDURE user_can_message_trigger();
--
--
--
