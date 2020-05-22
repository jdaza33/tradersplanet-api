/**
 * @description Controlador para el crud de cursos
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Instanciar el modelo
const Education = require('../models/education')

//Utils
const _util_response = require('../utils/response.util')

//Services
const serviceAws = require('../services/aws.srv')

module.exports = {
  create,
  get,
  list,
  del,
  edit,
  setImg,
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

    let max = await Education.findOne({}).sort({ order: -1 }).limit(1)
    data.order = max.order + 1

    let educationCreated = await mongoose.model('Educations').create(data)

    return res.status(200).send({
      success: 1,
      data: { education: educationCreated },
      error: null,
      message: _util_response.getResponse(35, req.headers.iso),
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
    let educationId = req.params.id

    let education = await mongoose
      .model('Educations')
      .findById(educationId)
      .populate({ path: 'tutor', select: '_id name ocupation email role' })

    if (!education) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(40, req.headers.iso),
      })
    }

    return res.status(200).send({
      success: 1,
      data: { education },
      error: null,
      message: _util_response.getResponse(38, req.headers.iso),
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

    let educations = await mongoose
      .model('Educations')
      .find(filters)
      .populate({ path: 'tutor', select: '_id name ocupation email role' })
      .sort({ order: -1 })
      .lean()

    // if (educations.length === 0) {
    //   return res.status(200).send({
    //     success: 0,
    //     data: null,
    //     error: _util_response.getResponse(41, req.headers.iso)
    //   })
    // }

    return res.status(200).send({
      success: 1,
      data: { education: educations },
      error: null,
      message: _util_response.getResponse(39, req.headers.iso),
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
    let educationId = req.params.id

    // Verificar si existe dicho id
    let education = await mongoose.model('Educations').findById(educationId)

    if (!education) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(40, req.headers.iso),
      })
    }

    // Eliminamos
    await mongoose.model('Educations').findByIdAndRemove(educationId)

    return res.status(200).send({
      success: 1,
      data: { education },
      error: null,
      message: _util_response.getResponse(37, req.headers.iso),
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
    let educationId = req.params.id
    let changes = req.body

    // Verificar si existe dicho id
    let education = await mongoose.model('Educations').findById(educationId)

    if (!education) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(40, req.headers.iso),
      })
    }

    let educationUpdated = await mongoose
      .model('Educations')
      .findByIdAndUpdate(educationId, { $set: changes }, { new: true })

    return res.status(200).send({
      success: 1,
      data: { education: educationUpdated },
      error: null,
      message: _util_response.getResponse(36, req.headers.iso),
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
async function setImg(req, res, next) {
  try {
    let educationId = req.params.id
    let file = req.file

    let files3 = await serviceAws.uploadFileToS3(
      file,
      'educations',
      educationId
    )

    await Education.findByIdAndUpdate(educationId, {
      img: files3.cdn,
    })

    return res.status(200).send({
      success: 1,
      data: null,
      error: null,
      message: _util_response.getResponse(2, req.headers.iso),
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
