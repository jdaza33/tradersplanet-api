/**
 * @description Controlador para el crud de contacto
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Utils
const _util_response = require('../utils/response.util')

//Services
const serviceNodemailer = require('../services/nodemailer.srv')

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
    let { email, name, subject, message } = req.body

    await serviceNodemailer.sendMail(subject, message, name, email)

    return res.status(200).send({
      success: 1,
      data: null,
      error: null,
      message: _util_response.getResponse(49, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}
