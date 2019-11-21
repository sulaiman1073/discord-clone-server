const router = require("express").Router();

router.use(require("./login"));
router.use(require("./logout"));
router.use(require("./validate"));

module.exports = router;
