/**
 * @description Manejo de rutas
 */

'use strict'

//Modules
const express = require('express')

//Constantes
const router = express.Router()

//Controllers
const userCtrl = require('../controllers/user.ctrl')

/**Users */
router.post('/users/create', userCtrl.create)
router.post('/users/list', userCtrl.list)
router.get('/users/:id', userCtrl.get)
router.put('/users/:id', userCtrl.edit)
router.delete('/users/:id', userCtrl.del)
router.post('/users/login', userCtrl.login)

/**Middleware - Devuelve un error 404 si la ruta solicitada no está definida */
router.use('*', (req, res) => {
  return res.status(404).send({
    success: 0,
    data: null,
    error: {
      status: 404,
      type: 'Resource not found',
      reason: 'Application does not support the requested path.'
    }
  })
})

module.exports = router
