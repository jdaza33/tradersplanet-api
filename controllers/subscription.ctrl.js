/**
 * @description Controlador para el crud de suscripciones
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Instanciar el modelo
const Subscription = require('../models/subscription')

//Utils
const _util_response = require('../utils/response.util')

module.exports = {
  create,
  list,
  get
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

    data.createdAt = Date.now()

    let subscriptionCreated = await Subscription.create(data)

    return res.status(200).send({
      success: 1,
      data: { subscription: subscriptionCreated },
      error: null,
      message: _util_response.getResponse(64, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @api {post} /subscriptions/list Listar suscripciones
 * @apiName listSubscriptions
 * @apiGroup Subscriptions
 * @apiDescription Servicio para listar las suscripciones,
 * tambien lista las tarjetas del usuario en caso de que posea
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} [userId] Cuando el usuario este logueado, se debe enviar su ID para verificar su cuenta
 * @apiHeader {String} iso Lenguaje del usuario, por defecto = "es"
 *
 */
async function list(req, res, next) {
  try {
    let filters = req.body

    let subscriptions = await Subscription.find(filters)
      .sort({ createdAt: -1 })
      .lean()
      .skip(req.skip)
      .limit(req.query.limit)

    return res.status(200).send({
      success: 1,
      data: { subscription: subscriptions, user: req.user },
      error: null,
      message: _util_response.getResponse(65, req.headers.iso),
      paginate: await _util_response.responsePaginate(
        req,
        'Subscriptions',
        filters
      ),
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
async function get(req, res, next) {
  try {
    let { id } = req.params

    let subscription = await Subscription.findById(id).lean()

    if (!subscription)
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(74, req.headers.iso),
      })

    return res.status(200).send({
      success: 1,
      data: { subscription, user: req.user },
      error: null,
      message: _util_response.getResponse(75, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}
