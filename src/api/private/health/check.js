const router = require("express").Router();
const logger = require("../../../config/logger");

router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      status: "available",
      currentTime: new Date().toLocaleString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: "unavailable",
      currentTime: new Date().toLocaleString(),
      uptime: process.uptime()
    });
    logger.error(error);
  }
});

module.exports = router;
