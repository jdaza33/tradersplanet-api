/**
 * @description Controlador para el crud de testimonios
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Instanciar el modelo
const Testimony = require('../models/testimony')

//Utils
const _util_response = require('../utils/response.util')

module.exports = {
  create,
  get,
  list,
  del,
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

    if (data.educationId == '') data.educationId = null

    let testimonyCreated = await mongoose.model('Testimonies').create(data)

    return res.status(200).send({
      success: 1,
      data: { testimony: testimonyCreated },
      error: null,
      message: _util_response.getResponse(21, req.headers.iso),
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
    let testimonyId = req.params.id

    let testimony = await mongoose
      .model('Testimonies')
      .findById(testimonyId)
      .populate({ path: 'educationId', select: '_id title' })

    if (!testimony) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(26, req.headers.iso),
      })
    }

    return res.status(200).send({
      success: 1,
      data: { testimony },
      error: null,
      message: _util_response.getResponse(24, req.headers.iso),
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
async function list(req, res, next) {
  try {
    let filters = req.body

    let testimonies = await mongoose
      .model('Testimonies')
      .find(filters)
      .populate({ path: 'educationId', select: '_id title' })
      .lean()

    testimonies = testimonies.map((t) => {
      let _t = { ...t }
      _t.abrv = `${t.name}: ${t.content.substring(0,50)}`
      return _t
    })

    // if (testimonies.length === 0) {
    //   return res.status(200).send({
    //     success: 0,
    //     data: null,
    //     error: _util_response.getResponse(27, req.headers.iso),
    //   })
    // }

    return res.status(200).send({
      success: 1,
      data: { testimony: testimonies },
      error: null,
      message: _util_response.getResponse(25, req.headers.iso),
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
async function del(req, res, next) {
  try {
    let testimonyId = req.params.id

    // Verificar si existe dicho id
    let testimony = await mongoose.model('Testimonies').findById(testimonyId)

    if (!testimony) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(26, req.headers.iso),
      })
    }

    // Eliminamos
    await mongoose.model('Testimonies').findByIdAndRemove(testimonyId)

    return res.status(200).send({
      success: 1,
      data: { testimony },
      error: null,
      message: _util_response.getResponse(23, req.headers.iso),
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
async function edit(req, res, next) {
  try {
    let testimonyId = req.params.id
    let changes = req.body
    changes.viewed = true

    // Verificar si existe dicho id
    let testimony = await mongoose.model('Testimonies').findById(testimonyId)

    if (!testimony) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(26, req.headers.iso),
      })
    }

    let testimonyUpdated = await mongoose
      .model('Testimonies')
      .findByIdAndUpdate(testimonyId, { $set: changes }, { new: true })

    return res.status(200).send({
      success: 1,
      data: { testimony: testimonyUpdated },
      error: null,
      message: _util_response.getResponse(22, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}
