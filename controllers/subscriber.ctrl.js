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
  create,
  list
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function create(req, res, next) {
  try {
    let { name, email, audienceId } = req.body
    let results = null

    let user = await Subscriber.findOne({ email })

    if (user) {
      let audiences = user.audienceIds ? user.audienceIds : []
      if (!audiences.includes(audienceId))
        results = await Subscriber.findOneAndUpdate(
          { email },
          { $push: { audienceIds: audienceId } }
        )
    } else {
      await serviceMailchimp.addMemberToAudience(name, email, audienceId)

      results = await Subscriber.create({
        name,
        email,
        audienceIds: [audienceId],
      })
    }

    return res.status(200).send({
      success: 1,
      data: { subscriber: results },
      error: null,
      message: _util_response.getResponse(52, req.headers.iso),
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
async function list(req, res, next) {
  try {
    let filters = req.body

    let subscribers = await Subscriber.find(filters)

    return res.status(200).send({
      success: 1,
      data: { subscriber: subscribers },
      error: null,
      message: _util_response.getResponse(52, req.headers.iso),
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
