/**
 * @description Controlador para el crud de audiencias
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Instanciar el modelo
const Subscriber = require('../models/subscriber')
const Audience = require('../models/audience')

//Services
const serviceMailchimp = require('../services/mailchimp.srv')

//Utils
const _util_response = require('../utils/response.util')

module.exports = {
  list,
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function list(req, res, next) {
  try {
    let filters = req.body

    let audiences = await Audience.find(filters)

    return res.status(200).send({
      success: 1,
      data: { audiences },
      error: null,
      message: _util_response.getResponse(51, req.headers.iso),
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
