/**
 * @description Controlador para el crud de suscripciones
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Models
const Subscription = require('../models/subscription')
const User = require('../models/user')

//Utils
const _util_response = require('../utils/response.util')

//Services
const { checkPaymentsUser } = require('../services/payments.srv')

module.exports = {
  create,
  list,
  get,
  ForwardEmail,
  edit,
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
    if (filters.active == 'all') delete filters.active
    else if (filters.active != 'all')
      filters = { ...filters, ...{ active: true } }

    console.log(filters)

    let subscriptions = await Subscription.find(filters)
      .sort({ createdAt: -1 })
      .lean()
      .skip(req.skip)
      .limit(req.query.limit)

    let __subscriptions = []
    for (let subscription of subscriptions) {
      let tmp = { ...subscription }
      delete tmp.payments
      if (subscription.payments.length > 0) {
        const { price, priceId, type } = subscription.payments[0]
        tmp = { ...tmp, price, priceId, type }
      }

      __subscriptions.push(tmp)
    }

    return res.status(200).send({
      success: 1,
      data: { subscription: __subscriptions, user: req.user },
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

    if (subscription.payments.length > 0) {
      const { price, priceId, type } = subscription.payments[0]
      subscription = { ...subscription, price, priceId, type }
    }

    delete subscription.payments

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

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function ForwardEmail(req, res, next) {
  try {
    let { id } = req.params

    const { sendMailNewSubscription } = require('../services/nodemailer.srv')

    const user = await User.findOne({ _id: id }, { subscriptionId: 1 }).lean()

    if (!user)
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(6, req.headers.iso),
      })

    if (!user.subscriptionId)
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(87, req.headers.iso),
      })

    const { subscriptionStatus } = await checkPaymentsUser(id)

    if (subscriptionStatus && subscriptionStatus.active)
      await sendMailNewSubscription(id)

    return res.status(200).send({
      success: 1,
      data: null,
      error: null,
      message: _util_response.getResponse(89, req.headers.iso),
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function edit(req, res, next) {
  try {
    let { id } = req.params
    let changes = req.body

    // let tmpPayments = changes.payments
    delete changes.payments

    let subscription = await Subscription.findById(id).lean()

    if (!subscription)
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(74, req.headers.iso),
      })

    // let postUpdated = await mongoose
    //   .model('Posts')
    //   .findByIdAndUpdate(postId, { $set: changes }, { new: true })

    // if (subscription.payments.length > 0) {
    //   const { price, priceId, type } = subscription.payments[0]
    //   subscription = { ...subscription, price, priceId, type }
    // }

    // delete subscription.payments

    return res.status(200).send({
      success: 1,
      data: { subscription },
      error: null,
      message: _util_response.getResponse(75, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}
