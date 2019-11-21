const { promisifyAll } = require("bluebird");
const migrate = promisifyAll(require("migrate"));
const { resolve } = require("path");
const migrationsDirectory = require("../../tools/migrationsDirectory");

async function resetDb() {
  const set = await migrate.loadAsync({
    stateStore: resolve(__dirname, "../../.migrate"),
    migrationsDirectory
  });

  const pSet = promisifyAll(set);

  await pSet.downAsync();
  await pSet.upAsync();
}

module.exports = resetDb;
