/**
 * @description Servidor principal
 */

//Modules
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const router = require('./routes/router')

//Constantes
const PORT = process.env.PORT || 3001

//Instancias
const app = express()
require('./config/db')

//Utils
const _util_error = require('./utils/error.util')

//Middlewares
app.use(cors())
app.use(express.json())
app.use(helmet())

//Routes
app.use('/', router)

/* MANEJO DE ERRORES DE EXPRESS */
app.use(_util_error.errorHandler)

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto: ${PORT}`)
})
