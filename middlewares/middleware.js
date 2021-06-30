/**
 * @description Manejo de middlewares
 */

'use strict'

// Modules
const mongoose = require('mongoose')

//Models
const User = require('../models/user')

//Utils
const _util_response = require('../utils/response.util')
const _util_security = require('../utils/security.util')

module.exports = { isAuth, isUser }

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

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
async function isUser(req, res, next) {
  try {
    let { userid: userId } = req.headers
    if (!userId) next()
    else {
      const { getCustomer } = require('../services/stripe.srv')
      const { checkPaymentsUser } = require('../services/payments.srv')

      let user = await User.findOne(
        { _id: userId },
        { _id: 1, name: 1, email: 1, stripeId: 1, active: 1 }
      ).lean()

      if (!user)
        return res.status(403).json({
          success: 0,
          data: null,
          message: _util_response.getResponse(6, req.headers.iso),
          error: null,
        })

      // if (!user.active)
      //   return res.status(403).json({
      //     success: 0,
      //     data: null,
      //     message: _util_response.getResponse(72, req.headers.iso),
      //     error: null,
      //   })

      let { id: customerId, cards } = await getCustomer({ userId }, false)

      user.cards = cards
      user.isNew = customerId && cards.length > 0 ? false : true

      const objStatusUser = await checkPaymentsUser(userId)
      user = { ...user, ...objStatusUser }

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
