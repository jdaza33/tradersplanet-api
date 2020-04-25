/**
 * @description Controlador para el crud de mailchimp
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
  insertAudiences,
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function insertAudiences(req, res, next) {
  try {
    let audiencesMailchimp = await serviceMailchimp.listAudiences()
    let data = audiencesMailchimp.map((a) => {
      return {
        name: a.name,
        webId: a.web_id,
        idMailchimp: a.id,
      }
    })

    let audiences = await Audience.find({})

    let notRegistered = []

    for (let d of data) {
      if (!audiences.map((a) => a.idMailchimp).includes(d.idMailchimp))
        notRegistered.push(d)
    }

    let newAudiences = await Audience.insertMany(notRegistered)

    return res.status(200).send({
      success: 1,
      data: { audiences: newAudiences },
      error: null,
      message: _util_response.getResponse(50, req.headers.iso)
    })
  } catch (error) {
    next(error)
  }
}
