const database = require("../database");
const resetDb = require("../../helpers/resetDb");

describe("database tests", () => {
  let client;

  beforeAll(async () => {
    client = await database.connect();
    await resetDb();
  });

  afterAll(async () => {
    await resetDb();
    await client.release();
    await database.end();
  });

  it("should create a table then add something to it then query it", async () => {
    await client.query(/* SQL */ `
      CREATE TABLE
        abcdefghijklmnop
      (x INT, y INT)`);

    const response = (await client.query(/* SQL */ `
      INSERT INTO
      abcdefghijklmnop
      (x, y)
      VALUES
      (1, 2)
      RETURNING x, y
      `)).rows[0];

    expect(response).toEqual({ x: 1, y: 2 });
  });
});
