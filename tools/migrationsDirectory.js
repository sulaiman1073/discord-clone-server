const { resolve } = require("path");

const migrationDirectory = resolve(__dirname, "../src/database/migrations");

module.exports = migrationDirectory;
