/* eslint-disable no-bitwise */
const router = require("express").Router();
const { distanceInWords } = require("date-fns");
const logger = require("../../../config/logger");

const floatToInt = num => num | 0;

router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      status: "available",
      currentTime: new Date().toLocaleString(),
      uptime: distanceInWords(0, floatToInt(process.uptime()), {
        includeSeconds: true
      })
    });
  } catch (error) {
    res.status(503).json({
      status: "unavailable",
      currentTime: new Date().toLocaleString(),
      uptime: distanceInWords(0, floatToInt(process.uptime()), {
        includeSeconds: true
      })
    });
    logger.error(error);
  }
});

module.exports = router;
