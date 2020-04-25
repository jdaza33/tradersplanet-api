/**
 * @description Controlador para el crud de webhook de mailchimp
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
  main,
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function main(req, res, next) {
  try {
    let { type, data } = req.body
    let email = data.email
    let audienceId = data.list_id
    let name = data.merges.FNAME

    if (type == 'subscribe') {
      let user = await Subscriber.findOne({ email })
      if (user) {
        let audiences = user.audienceIds ? user.audienceIds : []
        if (!audiences.includes(audienceId))
          await Subscriber.findOneAndUpdate(
            { email },
            { $push: { audienceIds: audienceId } }
          )
      } else
        await Subscriber.create({
          name,
          email,
          audienceIds: [audienceId],
        })
    }

    if (type == 'unsubscribe') {
      let user = await Subscriber.findOne({ email })
      if (user) {
        let audiences = user.audienceIds ? user.audienceIds : []
        if (audiences.includes(audienceId))
          await Subscriber.findOneAndUpdate(
            { email },
            { $pull: { audienceIds: audienceId } }
          )
      }
    }

    return res.status(200).send({
      success: 1,
      error: null,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
