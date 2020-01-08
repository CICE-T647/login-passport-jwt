const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error) res.status(500).json({ message: json });

    const payload = {
      sub: user._id,
      exp: Date.now() + process.env.JWT_EXPIRES,
      username: user.username
    };

    const token = jwt.sign(payload, { secret: process.env.JWT_SECRET });

    res.status(200).json({ data: { token } });
  })(req, res);
});

module.exports = router;
