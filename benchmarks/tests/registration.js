const autocannon = require("autocannon");
const faker = require("faker");
const fastJson = require("fast-json-stringify");
const { outputJsonSync } = require("fs-extra");
const { resolve, parse } = require("path");
const { format: dateFormat, parse: dateParse } = require("date-fns");
const config = require("../../src/config");
const logger = require("../../src/config/logger");

const stringify = fastJson({
  title: "Example Schema",
  type: "object",
  properties: {
    firstName: {
      type: "string"
    },
    lastName: {
      type: "string"
    },
    username: {
      type: "string"
    },
    email: {
      type: "string"
    },
    password: {
      type: "string"
    },
    dateOfBirth: {
      type: "string"
    }
  }
});

function finishedBench(err, results) {
  if (err) {
    logger.error(err);
  }
  logger.info(results);
  outputJsonSync(
    resolve(__dirname, `../results/${parse(__filename).name}.json`),
    results,
    {
      spaces: "\t"
    }
  );
}

function setupClient(client) {
  client.setBody(
    stringify({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      dateOfBirth: dateFormat(
        dateParse(faker.date.between("1950-01-01", "2000-01-01")),
        "YYYY-MM-DD"
      )
    })
  );
}

const instance = autocannon(
  {
    title: "Register and login users",
    url: `http://${config.host}:${config.port}/api/users`,
    connections: 100,
    pipelining: 1,
    duration: 40,
    setupClient,
    method: "POST",
    headers: { "Content-type": "application/json; charset=utf-8" },
    body: stringify({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      dateOfBirth: dateFormat(
        dateParse(faker.date.between("1950-01-01", "2000-01-01")),
        "YYYY-MM-DD"
      )
    })
  },
  finishedBench
);

autocannon.track(instance);

instance.on("response", client => {
  client.setBody(
    stringify({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      dateOfBirth: dateFormat(
        dateParse(faker.date.between("1950-01-01", "2000-01-01")),
        "YYYY-MM-DD"
      )
    })
  );
});

process.once("SIGINT", () => {
  instance.stop();
});
