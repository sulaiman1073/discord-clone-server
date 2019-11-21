const router = require("express").Router();

router.use(require("./initChat"));
router.use(require("./typing"));

module.exports = router;
