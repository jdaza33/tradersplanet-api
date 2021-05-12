/**
 * @description Servidor principal
 */

//Modules
const express = require('express')
const paginate = require('express-paginate')
const cors = require('cors')
const helmet = require('helmet')
const router = require('./routes/router')
const mkdirp = require('mkdirp')
const path = require('path')
const bodyParser = require('body-parser')

//Constantes
const PORT = process.env.PORT || 3001

//Instancias
const app = express()

//Utils
const _util_error = require('./utils/error.util')

//Creando carpeta files/ si no existe
mkdirp.sync(path.join(__dirname, 'files/'))

//Middlewares
app.set('view engine', 'html')
app.use(cors())
app.use(express.json())
// app.use(express.urlencoded())
app.use(paginate.middleware(10, 50))
app.use(helmet())

//Loaders
require('./loaders/dotenv.loader').startDotenv()

//Database
require('./config/db')

//Routes
app.use('/api', router)

//Doc
app.use(express.static(path.resolve(__dirname, './doc')))
app.use('/doc', function (req, res) {
  res.sendFile(path.join(__dirname, '/doc/index.html'))
})

/* MANEJO DE ERRORES DE EXPRESS */
app.use(_util_error.errorHandler)

//Sockets
// require('./io/chat.io')

app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto: ${PORT}`)
  console.log('Modo --> ' + process.env.NODE_ENV)
})
