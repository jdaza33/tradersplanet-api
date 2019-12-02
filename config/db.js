/**
 * @description Conexion la base de datos
 */

//Modules
const mongoose = require('mongoose')
require('dotenv').config()

const MONGO_URL = process.env.URL_MONGO

// mongoose.connect(MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false
// })
// mongoose.connection.on('connected', () => {
//   console.log(`Conectando a la base de datos --> ${MONGO_URL}`)
// })
// mongoose.connection.on('error', err => {
//   console.log(
//     `Error al conectar con la base de datos --> ${JSON.stringify(err)}`
//   )
// })
// mongoose.connection.on('disconnected', () => {
//   console.log('Desconectando de la base de datos')
// })
// process.on('SIGINT', () => {
//   mongoose.connection.close(() => {
//     console.log('Desconectando de la base de datos al cerrar la aplicación')
//     process.exit(0)
//   })
// })

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
