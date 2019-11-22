const router = require("express").Router();

router.use(require("./addGuild"));
router.use(require("./deleteGuild"));
router.use(require("./updateGuild"));

module.exports = router;
