const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.post("/", (req, res) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error) res.status(500).json({ message: json });

    console.log(user)
    const payload = {
      sub: user._id,
      // Transformamos la variable de entorno a número para poder operar con date.now
      exp: Date.now() + parseInt(process.env.JWT_EXPIRES),
      username: user.username
    };

    const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET );

    res.status(200).json({ data: { token } });
  })(req, res);
});

module.exports = router;
