CREATE TABLE users (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT NOT NULL,
  discriminator SMALLINT NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  email CITEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_length CHECK(length(username) > 1 AND length(username) < 30),
  CONSTRAINT discriminator_size CHECK(discriminator >= 0 AND discriminator <= 9999),
  CONSTRAINT unique_email UNIQUE(email),
  CONSTRAINT unique_username_discriminator UNIQUE (username, discriminator) DEFERRABLE INITIALLY IMMEDIATE,
  CONSTRAINT bounded_status CHECK(status = 'available' OR status = 'away' OR status = 'busy')
);

CREATE TABLE guilds (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  invite_code UUID NOT NULL DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT name_length CHECK(length(name) > 1 AND length(name) < 100)
);

CREATE TABLE channels (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  position SMALLINT NOT NULL,
  topic TEXT,
  guild_id UUID NOT NULL REFERENCES guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT name_length CHECK(length(name) > 1 AND length(name) < 100),
  CONSTRAINT topic_length CHECK(length(topic) <= 1024),
  CONSTRAINT unique_positions UNIQUE (guild_id, position) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE messages (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  message TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  channel_id UUID NOT NULL REFERENCES channels(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT message_length CHECK(length(message) >= 1 AND length(message) <= 2000)
);

CREATE TABLE members (
  guild_id UUID NOT NULL REFERENCES guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (guild_id, user_id)
);

CREATE TABLE friends (
  first_user_id UUID NOT NULL REFERENCES users(id),
  second_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (first_user_id, second_user_id)
);

CREATE TABLE email_verification_tokens (
  user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  verification_token UUID NOT NULL DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, verification_token)
);
