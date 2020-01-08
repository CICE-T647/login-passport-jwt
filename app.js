require("dotenv").config();
var express = require("express");
var path = require("path");

var indexRouter = require("./routes/index");
const User = require("./models/User");
const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = requires("passport-jwt").ExtractJwt;

const bcrypt = require("bcrypt");

var app = express();

app.use(passport.initialize());

const localOpts = {
  usernameField: "email",
  passwordField: "pasword",
  session: false
};
passport.use(
  new LocalStrategy(localOpts, async (email, password, next) => {
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
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(opts, async (token, next) => {
    try {
      const user = await findByOne({ id: token.sub });

      if (!user) next(null, false, { message: "invalida token" });

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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ message: "Not found" });
});

module.exports = app;
