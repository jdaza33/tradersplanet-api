/**
 * @description Manejo de autenticacion
 */

'use strict'

// Modules
const mongoose = require('mongoose')

//Utils
const _util_response = require('../utils/response.util')
const _util_security = require('../utils/security.util')

module.exports = { isAuth }

/**
 * @description Comprueba si el token es valido y no ha expirado
 * @param {*} req
 */
async function isAuth(req, res, next) {
  try {
    // La cabecera de autorización tiene el formato: "<bearer> <token>"
    let token = req.headers.authorization
    if (!token)
      return res.status(403).json({
        success: 0,
        data: null,
        message: _util_response.getResponse(66, req.headers.iso),
        error: null,
      })
    else token = req.headers.authorization.split(' ')[1]

    let { id: userId, role, exp: expToken } = _util_security.decodeToken(token)

    if (userId) {
      if (expToken < Date.now())
        return res.status(403).json({
          success: 0,
          data: null,
          message: _util_response.getResponse(68, req.headers.iso),
          error: null,
        })

      let user = await mongoose
        .model('Users')
        .findOne({ _id: userId }, { _id: 1, name: 1, stripeId: 1, active: 1 })
        .lean()

      if (!user || !user.active)
        return res.status(403).json({
          success: 0,
          data: null,
          message: _util_response.getResponse(6, req.headers.iso),
          error: null,
        })

      /**
       * @todo
       * Falta verificar las tarjetas del usuario
       * Falta verificar la suscripcion del usuario
       */

      user.cards = []
      req.user = user
      next()
    }
  } catch (error) {
    console.log(error)
    return res.status(403).json({
      success: 0,
      data: null,
      message: await _util_response.getResponse(67, req.headers.iso),
      error: error.toString(),
    })
  }
}
