const redis = require("../redis");

describe("redis tests", () => {
  beforeAll(async () => {
    await redis.flushall();
  });

  afterAll(async () => {
    await redis.flushall();
    await redis.quit();
  });

  it("should connect and then add a key and then retrieve it", async () => {
    await redis.set("abc", "123");
    const val = await redis.get("abc");
    expect(val).toBe("123");
  });
});
