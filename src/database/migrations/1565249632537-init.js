const path = require("path");
const { promisify } = require("bluebird");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const database = require("../../config/database");
const logger = require("../../config/logger");
const {
  defaultGuild,
  adminUsername,
  adminPassword,
  adminEmail
} = require("../../config");

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const getSqlFilesStr = async () => {
  let sqlFiles = "";
  const concatFolderFiles = async folder => {
    const folderFiles = await readdir(
      path.join(__dirname, `../sql/1565249632537-init/up/${folder}`)
    );

    for await (const file of folderFiles) {
      const sql = await readFile(
        path.join(__dirname, `../sql/1565249632537-init/up/${folder}/${file}`),
        "utf-8"
      );
      sqlFiles = `${sqlFiles}${sql}\n`;
    }
  };

  // EXTENSIONS
  await concatFolderFiles("extensions");
  // FUNCTIONS
  await concatFolderFiles("functions");
  // TABLES
  await concatFolderFiles("tables");
  // VIEWS
  await concatFolderFiles("views");
  // PROCS
  await concatFolderFiles("procs");
  // TRIGGERS
  await concatFolderFiles("triggers");
  // INDICES
  await concatFolderFiles("indices");

  return sqlFiles;
};

module.exports.up = async () => {
  const client = await database.connect();
  try {
    const sql = await getSqlFilesStr();

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await client.query("BEGIN");
    await client.query("CREATE SCHEMA IF NOT EXISTS public");
    await client.query(sql);
    const adminUser = await client.query(
      /* SQL */ `
      INSERT INTO
        users
      (
        username,
        password,
        email
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING
        id as "userId"`,
      [adminUsername, hashedPassword, adminEmail]
    );

    await client.query(
      /* SQL */ `
      INSERT INTO
        guilds
      (
        id,
        name,
        owner_id
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
    `,
      [defaultGuild, "Home", adminUser.rows[0].userId]
    );

    await client.query(/* SQL */ `
      CREATE OR REPLACE FUNCTION join_default_guild_trigger()
      RETURNS TRIGGER AS $BODY$
      BEGIN
        INSERT INTO
          members
          (
            guild_id,
            user_id
          )
        VALUES
          (${`'${defaultGuild}'`}, NEW.id);
      RETURN NEW;
      END;
      $BODY$ LANGUAGE plpgsql;
      `);

    await client.query(/* SQL */ `
      CREATE TRIGGER join_default_guild
      AFTER INSERT ON users
      FOR EACH ROW EXECUTE PROCEDURE join_default_guild_trigger()`);

    await client.query(
      /* SQL */ `
      INSERT INTO
        members
        (
          guild_id,
          user_id
        )
    VALUES
      ($1, $2)
      `,
      [defaultGuild, adminUser.rows[0].userId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
  } finally {
    await client.release();
  }
};

module.exports.down = async () => {
  const client = await database.connect();
  try {
    const sql = await readFile(
      path.join(__dirname, "../sql/1565249632537-init/down/init-down.sql"),
      "utf-8"
    );

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error(error);
  } finally {
    await client.release();
  }
};

module.exports.description = "V1.0";
