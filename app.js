require("dotenv").config();
var express = require("express");
var path = require("path");
const mongoose = require("mongoose")
var indexRouter = require("./routes/index");
const User = require("./models/User");
const passport = require("passport");

// importamos la estrategia local
const LocalStrategy = require("passport-local").Strategy;

// Importamos la estrategia json web token
const JwtStrategy = require("passport-jwt").Strategy;

// Importamos la funcionalidad para descomoprimir el token. 
const ExtractJwt = require("passport-jwt").ExtractJwt;

// Sustituido bcrypt por bcrypjs para su implementación también en windows
const bcrypt = require("bcryptjs");

var app = express();


// 1. CONFIGURAMOS EN EXPRESS LA CONFIGURACIÓN DE PASSPORT
/* Dado que para la autenticación por token no es necesario el uso de sesiones
  no será necesario la configuración de la sessión:
    app.use(passport.session());

  Tampoco será necesario configurar, por tanto, el serialize y deserialize y 

*/
app.use(passport.initialize());



// 2. DEFINIMOS LA ESTRATEGIA LOCAL. 
/* Esta estrategia servirá para establecer el login. 
  En ella comprobaremos que los datos de usuario son correctos (en este caso que exista y que la 
  contraseña sea validad) */

passport.use(
// La estrategía local recibe un primer parametro de configuración y un callback de verificación como segundo parametro
  new LocalStrategy(  {
    // Los campos usernameField y passwordField, servirán para definir 
    // el nombre de los atributos por los que encontraremos y comprobaremos al usuario
    usernameField: "email",
    passwordField: "password",
    // Dado que no haremos uso de sesiones, es necesaria especificarlo en las distintas estrategias poniendolo a false. 
    session: false
  }, async (email, password, next) => {
    console.log(`Estrategia local. Información recibida: email ${email}, password${password}`)
    try {
      // Buscamos el usuario a travñes del email
      const user = await User.findOne({ email });


      /*Si no hay usuario enviamos ejecutamos next con el primer parametro (error) a null, el segundo parametro 
       (data, en este caso usuario) a false y el tercer parametro (info) con el mensaje de error*/
      if (!user) next(null, false, { message: "El usuario no existe" });

      // comprobamos la contraseña y procedemos igual que si no hay usuario
      if (!bcrypt.compareSync(password, user.password))
        next(null, false, { message: "la contraseña no es correcta" });

      // Si el usuario existe y la contraseña es correcta, lo enviamos como segundo parametro de la función next. 
      next(null, user);
    } catch (error) {

      //Si hay un error, lo envíamos como primer parametro de la función next.
      next(error);
    }
  })
);
// 3. Tras esta función definiremos la ruta login (ir a ./routes/auth/login para continuar)



// 4. DEFINIMOS LA CONFIGURACIÓN DE LA ESTRATEGIA JWT
const opts = {
  // Especificamos de donde queremos extraer el token. En este caso de los headers como Bearer token
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // Señalamos el SECRET para comprobar que el token es correcto.
  secretOrKey: process.env.JWT_SECRET
};


passport.use(
  // La estrategía jwt, al igual que la local, recibe un primer parametro de configuración y un callback de verificación como segundo parametro
  // en este caso, el objeto de configuración lo hemos declarado en la constante opts anterior
  new JwtStrategy(opts, async (tokenPayload, next) => {
    console.log(`Estrategia jwt. Información recibida: token ${tokenPayload}`)

    // El callback de verificación, en este caso, recibe el token en formato json. 
    try {
      // Buscamos el usuario por id accediendo al atributo sub del token que hemos definido en el login
      const user = await User.findOne({ _id: tokenPayload.sub });

      // si el usuario no existe enviamos como tercer parametro (info) el mensaje de error, 
      // el usuario (segundo parametro) a false
      // y el error (primer parametro) a null
      if (!user) next(null, false, { message: "invalid token" });

      // si el usuario existe, enviamos el primer parametro a null y el segundo con el usuario
      next(null, user);
    } catch (error) {
      //En caso de error enviamos el error como primer parametro
      next(error);
    }
  })
);
// 5. Tras esto, podemos proceder a autenticar las rutas (ir a ./routes/index)





app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", require("./routes/auth"))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ message: "Not found" });
});


mongoose.connect("mongodb://localhost:27017/auth-jwt",  { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}).then(()=> console.log("Base de datos conectada"))
  .catch(()=> {throw error})

module.exports = app;
