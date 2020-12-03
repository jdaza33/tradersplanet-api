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
  createWithSource,
  createSesion,
  getSession,
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

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function createWithSource(req, res, next) {
  try {
    let data = req.body

    let pay = await serviceStripe.newPaymentWithSource(data)

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

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function createSesion(req, res, next) {
  try {
    let data = req.body
    console.log(data)

    let sesion = await serviceStripe.newPaymentCheckout(data)

    return res.status(200).send({
      success: 1,
      sesion,
      error: null,
      message: _util_response.getResponse(63, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function getSession(req, res, next) {
  try {
    let { sessionId } = req.params

    let sesion = await serviceStripe.getSessionId(sessionId)

    return res.status(200).send({
      success: 1,
      sesion,
      error: null,
      message: _util_response.getResponse(63, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}
