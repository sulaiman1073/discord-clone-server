const bcrypt = require("bcryptjs");
const database = require("../../config/database");
const logger = require("../../config/logger");
const addUser = require("../queries/addUser");
const addGuild = require("../queries/addGuild");
const addMember = require("../queries/addMember");

async function seedDb() {
  logger.debug("Seeding database...");

  const client = await database.connect();

  const password = await bcrypt.hash("password", 10);

  try {
    await client.query("BEGIN");

    const user1 = await addUser(
      {
        username: "user1",
        password,
        email: "abc1@gmail.com"
      },
      client
    );
    const user2 = await addUser(
      {
        username: "user2",
        password,
        email: "abc2@gmail.com"
      },
      client
    );
    const user3 = await addUser(
      {
        username: "user3",
        password,
        email: "abc3@gmail.com"
      },
      client
    );
    const user4 = await addUser(
      {
        username: "user4",
        password,
        email: "abc4@gmail.com"
      },
      client
    );
    const user5 = await addUser(
      {
        username: "user5",
        password,
        email: "abc5@gmail.com"
      },
      client
    );

    const guild1 = await addGuild(
      {
        name: "someGuild",
        ownerId: user1.id
      },
      client
    );
    const guild2 = await addGuild(
      {
        name: "other",
        ownerId: user2.id
      },
      client
    );

    await addMember(
      {
        guildId: guild1.id,
        userId: user1.id
      },
      client
    );
    await addMember(
      {
        guildId: guild1.id,
        userId: user2.id
      },
      client
    );
    await addMember(
      {
        guildId: guild1.id,
        userId: user3.id
      },
      client
    );
    await addMember(
      {
        guildId: guild2.id,
        userId: user1.id
      },
      client
    );
    await addMember(
      {
        guildId: guild2.id,
        userId: user2.id
      },
      client
    );
    await addMember(
      {
        guildId: guild2.id,
        userId: user4.id
      },
      client
    );
    await addMember(
      {
        guildId: guild2.id,
        userId: user5.id
      },
      client
    );

    await client.query("COMMIT");

    logger.debug("Seeded database.");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
  } finally {
    await client.release();
    await database.end();
  }
}

seedDb();
