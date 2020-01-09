const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");


// 3. Definimos la ruta login para devolver el token al usuario
router.post("/", (req, res) => {
  // procedemos a autenticar la estrategia local 
  passport.authenticate("local", { session: false }, (error, user, info) => {
    console.log(`Autenticación de estrategia local. Información recibida: error: ${error}, user: ${user}, info: ${info}`)


    // Si hay un error de servidor, envíamos un 500 
    if (error) res.status(500).json({ message: "Hubo un error" });

    // Si hay info, el error será del cliente, por lo que lo devolvemos con un 400
    if (info) res.status(400).json({ message: info });


    // Procedemos a definir el payload del token. 
    // en el podemos introducir la información establecer para la comunicación implicita entre el cliente y el servidor
    const payload = {
      // Declaramos la id de usuario, para poder acceder a ella más tarde(En el punto 4)
      sub: user._id,
      // Definimos el tiempo de expiración
      // !NOTA: Transformamos la variable de entorno a número para poder operar con date.now
      exp: Date.now() + parseInt(process.env.JWT_EXPIRES),

      //Enviamos información útil adicional
      username: user.username
    };


    // Haciendo uso de la librería jsonwentoken generamos el token:
    // como primer parametro recibe el payload en formato string (por lo que hay que "stringifycarlo")
    // como segundo parámetro, recibe el SECRET también en formato de string. Lo recogemos del archivo .env 
    const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET );


    //Devolvemos el token al usuario
    res.status(200).json({ data: { token } });
    // Ejecutamos la función pasandole los parametros req y res 
  })(req, res);
});

module.exports = router;
