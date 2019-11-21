const { spawnSync } = require("child_process");
const { resolve } = require("path");
const relative = require("relative");
const migrationsDirectory = require("./migrationsDirectory");

const migrateCommand = resolve(
  __dirname,
  "../",
  "node_modules/migrate/bin/migrate"
);

const command = process.argv[2];

if (command === "create") {
  // migrations-dir has to be a relative path here
  const migrationsDirectoryRelative = relative(
    process.cwd(),
    migrationsDirectory
  );
  spawnSync(
    "node",
    [
      migrateCommand,
      "create",
      process.argv[3],
      `--migrations-dir=${migrationsDirectoryRelative}`
    ],
    { stdio: "inherit" }
  );
} else if (command === "up" || command === "down") {
  spawnSync(
    "node",
    [
      migrateCommand,
      command,
      ...(process.argv[3] ? process.argv[3] : []),
      `--migrations-dir=${migrationsDirectory}`
    ],
    { stdio: "inherit" }
  );
} else if (command === "list") {
  spawnSync(
    "node",
    [migrateCommand, "list", `--migrations-dir=${migrationsDirectory}`],
    { stdio: "inherit" }
  );
}
