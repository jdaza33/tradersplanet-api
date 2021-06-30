/**
 * @description Controlador para el crud de pagos
 */

//Modules
const mongoose = require('mongoose')

//Utils
const _util_response = require('../utils/response.util')

//Services
const serviceStripe = require('../services/stripe.srv')
const { newPayment } = require('../services/payments.srv')

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
 * @deprecated
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

/**
 * @api {post} /payments/create/stripe Realizar un pago con Stripe
 * @apiName payWithStripe
 * @apiGroup Payments
 * @apiDescription Servicio para realizar un pago con la plataforma de stripe,
 * guarda el cliente si es nuevo, guarda sus tarjetas y crear una suscripcion si aplica.
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} authorization Bearer {token}
 * @apiHeader {String} iso Lenguaje del usuario, por defecto = "es"
 *
 * @apiParam {String="education","service", "subscription"} type Tipo del modelo que desea comprar o registrar
 * @apiParam {String} typeId ID del modelo
 * @apiParam {String} [priceId] Ocurrencia del pago, solo aplica para suscripciones.. Se encuentra al consultar suscripciones
 * @apiParam {String} userId ID del usuario que realiza el pago
 * @apiParam {Boolean} isNew true si el usuario es nuevo y false si ya esta registrado en stripe (Para saber si esta registrado en stripe y tiene tarjetas, antes debe consultar /users/check-cards)
 * @apiParam {String} [source] En caso de que isNew sea falso, entonces se envia el source de la tarjeta
 * @apiParam {String} [coupon] Codigo de descuento, en caso de que el usuario lo tenga.
 * @apiParam {Boolean} [useCard] Solo se envia cuando el usuario tenga tarjetas y se quiera usar alguna de ellas. Se encuentra el objeto del usuario
 *
 * @apiParamExample {json} Request-Example:
 * {
 *  type: "education",
 *  typeId: "123456789",
 *  priceId: "price_XXXXX"
 *  userId: "123456789",
 *  isNew: true,
 *  coupon: 'FREEALL2021'
 *  source: 'source_123456789'
 *  useCard: 'card_XXXXX'
 * }
 *
 *
 */
async function payWithStripe(req, res, next) {
  try {
    let pay = await newPayment(req.body)

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

async function createSourceCard(req, res, next) {
  try {
    const { createSource } = require('../services/stripe.srv')

    return res.status(200).send({
      success: 1,
      data: { id: await createSource(req.body) },
      error: null,
      message: _util_response.getResponse(54, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  create,
  createWithSource,
  createSesion,
  getSession,
  payWithStripe,
  createSourceCard
}
