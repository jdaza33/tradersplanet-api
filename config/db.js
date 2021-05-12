/**
 * @description Conexion la base de datos
 */

//Modules
const mongoose = require('mongoose')

// Inicializar la conexión al servidor de BD
mongoose.connect(
  process.env.URL_MONGO,
  { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false },
  (err, res) => {
    if (err) {
      console.log(`Error al conectar a la base de datos: ${err}`)
    }
    console.log(`Conectando a la base de datos --> ${process.env.URL_MONGO}`)
  }
)
