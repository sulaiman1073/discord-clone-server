const router = require("express").Router();
const authenticateUser = require("../../../helpers/middleware/authenticateUser");

router.post("/logout", authenticateUser, (req, res) => {
  req.logout();
  res.status(204).json({});
});

module.exports = router;
