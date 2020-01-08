var express = require("express");
var router = express.Router();
const passport = require("passport");

const isAutenticated = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    if (error) res.status(500).json({ message: error });

    if (!user) res.status(401).json({ message: "No autorizado" });
  })(req, res, next);

  next();
};

/* GET home page. */
router.get("/", isAutenticated, (req, res, next) => {
  res.json({ message: "Autorizado" });
});

module.exports = router;
