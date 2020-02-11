/**
 * @description Conexion la base de datos
 */

//Modules
const mongoose = require('mongoose')
require('dotenv').config()

const MONGO_URL = process.env.URL_MONGO

// Inicializar la conexión al servidor de BD
mongoose.connect(
  MONGO_URL,
  { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false },
  (err, res) => {
    if (err) {
      console.log(`Error al conectar a la base de datos: ${err}`)
    }
    console.log(`Conectando a la base de datos --> ${MONGO_URL}`)
  }
)
