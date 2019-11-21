const router = require("express").Router();

router.use(require("./getGuild"));
router.use(require("./addGuild"));
router.use(require("./deleteGuild"));
router.use(require("./updateGuild"));

module.exports = router;
