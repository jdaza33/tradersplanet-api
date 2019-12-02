/**
 * @description Controlador para el crud de servicios
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Utils
const _util_response = require('../utils/response.util')

module.exports = {
  create,
  get,
  list,
  del,
  edit
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

    let serviceCreated = await mongoose.model('Services').create(data)

    return res.status(200).send({
      success: 1,
      data: { service: serviceCreated },
      error: null,
      message: _util_response.getResponse(42, req.headers.iso)
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
    let serviceId = req.params.id

    let service = await mongoose.model('Services').findById(serviceId)

    if (!service) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(47, req.headers.iso)
      })
    }

    return res.status(200).send({
      success: 1,
      data: { service },
      error: null,
      message: _util_response.getResponse(45, req.headers.iso)
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

    let services = await mongoose.model('Services').find(filters)

    if (services.length === 0) {
      return res.status(200).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(48, req.headers.iso)
      })
    }

    return res.status(200).send({
      success: 1,
      data: { service: services },
      error: null,
      message: _util_response.getResponse(46, req.headers.iso)
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
    let serviceId = req.params.id

    // Verificar si existe dicho id
    let service = await mongoose.model('Services').findById(serviceId)

    if (!service) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(47, req.headers.iso)
      })
    }

    // Eliminamos
    await mongoose.model('Services').findByIdAndRemove(serviceId)

    return res.status(200).send({
      success: 1,
      data: { service },
      error: null,
      message: _util_response.getResponse(44, req.headers.iso)
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
    let serviceId = req.params.id
    let changes = req.body

    // Verificar si existe dicho id
    let service = await mongoose.model('Services').findById(serviceId)

    if (!service) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(47, req.headers.iso)
      })
    }

    let serviceUpdated = await mongoose
      .model('Services')
      .findByIdAndUpdate(serviceId, { $set: changes }, { new: true })

    return res.status(200).send({
      success: 1,
      data: { service: serviceUpdated },
      error: null,
      message: _util_response.getResponse(43, req.headers.iso)
    })
  } catch (error) {
    next(error)
  }
}
