require("dotenv").config();
var express = require("express");
var path = require("path");
const mongoose = require("mongoose")
var indexRouter = require("./routes/index");
const User = require("./models/User");
const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

// Sustituido bcrypt por bcrypjs para su implementación también en windows
const bcrypt = require("bcryptjs");

var app = express();

app.use(passport.initialize());


passport.use(

  new LocalStrategy(  {
    usernameField: "email",
    passwordField: "password",
    session: false
  }, async (email, password, next) => {

    try {

      const user = await User.findOne({ email });


      if (!user) next(null, false, { message: "El usuario no existe" });

      if (!bcrypt.compareSync(password, user.password))
        next(null, false, { message: "la contraseña no es correcta" });

      next(null, user);
    } catch (error) {
      next(error);
    }
  })
);

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(opts, async (token, next) => {
    console.log(token)
    try {
      const user = await User.findOne({ _id: token.sub });


      if (!user) next(null, false, { message: "invalid token" });

      next(null, user);
    } catch (error) {
      next(error);
    }
  })
);

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", require("./routes/auth"))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ message: "Not found" });
});


mongoose.connect("mongodb://localhost:27017/auth-jwt")

module.exports = app;
