const router = require("express").Router();

router.use(require("./addMessage"));
router.use(require("./getMessages"));

module.exports = router;
