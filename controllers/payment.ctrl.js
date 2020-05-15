/**
 * @description Controlador para el crud de pagos
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Utils
const _util_response = require('../utils/response.util')

//Services
const serviceStripe = require('../services/stripe.srv')

module.exports = {
  create,
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function create(req, res, next) {
  try {
    let data = req.body

    let pay = await serviceStripe.newPayment(data)

    return res.status(200).send({
      success: 1,
      data: { pay },
      error: null,
      message: _util_response.getResponse(54, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}
