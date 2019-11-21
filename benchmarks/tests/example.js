const autocannon = require("autocannon");
const faker = require("faker");
const fastJson = require("fast-json-stringify");
const { outputJsonSync } = require("fs-extra");
const { resolve, parse } = require("path");
const config = require("../../src/config");
const logger = require("../../src/config/logger")

const stringify = fastJson({
  title: "Example Schema",
  type: "object",
  properties: {
    something: {
      type: "string"
    },
    anotherThing: {
      type: "string"
    }
  }
});

let exampleId = 1;
let getCounter = 0;

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

const instance = autocannon(
  {
    title: "Post and Get examples",
    url: `http://${config.host}:${config.port}`,
    connections: 100,
    pipelining: 1,
    duration: 40,
    requests: [
      {
        path: "/api/example",
        method: "POST",
        headers: { "Content-type": "application/json; charset=utf-8" },
        body: stringify({
          something: faker.name.firstName(),
          anotherThing: faker.name.lastName()
        })
      },
      {
        path: `/api/example/${exampleId}`,
        method: "GET"
      }
    ]
  },
  finishedBench
);

autocannon.track(instance);

instance.on("response", client => {
  if (client.requestIterator.currentRequestIndex === 0) {
    client.setRequest({
      path: "/api/example",
      method: "POST",
      headers: { "Content-type": "application/json; charset=utf-8" },
      body: stringify({
        something: faker.name.firstName(),
        anotherThing: faker.name.lastName()
      })
    });
  } else if (client.requestIterator.currentRequestIndex === 1) {
    if (getCounter === 3) {
      getCounter = 0;
      exampleId++;
      client.setRequest({
        path: `/api/example/${exampleId}`,
        method: "GET"
      });
    } else {
      getCounter++;
    }
  }
});

process.once("SIGINT", () => {
  instance.stop();
});
