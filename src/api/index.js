const router = require("express").Router();

// add authentication middleware for admins
router.use("/admin", require("./private"));
router.use(require("./public"));

module.exports = router;
