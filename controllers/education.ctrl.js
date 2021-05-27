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
  move,
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
 * @api {post} /educations/list Listar cursos
 * @apiName listEducations
 * @apiGroup Educations
 * @apiDescription Servicio para listar los cursos,
 * tambien lista las tarjetas del usuario en caso de que posea
 * @apiVersion 1.0.0
 *
 * @apiHeader {String} authorization Bearer {token}
 *
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
      .skip(req.skip)
      .limit(req.query.limit)

    return res.status(200).send({
      success: 1,
      data: { education: educations, user: req.user },
      error: null,
      message: _util_response.getResponse(39, req.headers.iso),
      paginate: await _util_response.responsePaginate(
        req,
        'Educations',
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

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function move(req, res, next) {
  try {
    let educationId = req.params.id
    let { op } = req.body

    // Verificar si existe dicho id
    let education = await Education.findById(educationId)

    if (!education) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(40, req.headers.iso),
      })
    }

    if (op == 'up') {
      let max = await Education.findOne({}).sort({ order: -1 }).limit(1)
      if (education.order < max.order) {
        let tmp = await Education.findOne({ order: education.order + 1 }).lean()

        if (tmp) {
          await mongoose
            .model('Educations')
            .findByIdAndUpdate(tmp._id, { $set: { order: 1000000 } })
          await mongoose
            .model('Educations')
            .findByIdAndUpdate(
              educationId,
              { $set: { order: education.order + 1 } },
              { new: true }
            )
          await mongoose
            .model('Educations')
            .findByIdAndUpdate(
              tmp._id,
              { $set: { order: education.order } },
              { new: true }
            )
        }
      } else {
        return res.status(200).send({
          success: 2,
          data: null,
          error: null,
          message: 'The course has the highest order',
        })
      }
    } else {
      if (education.order > 1) {
        let tmp = await Education.findOne({ order: education.order - 1 }).lean()

        if (tmp) {
          await mongoose
            .model('Educations')
            .findByIdAndUpdate(tmp._id, { $set: { order: 1000000 } })
          await mongoose
            .model('Educations')
            .findByIdAndUpdate(
              educationId,
              { $set: { order: education.order - 1 } },
              { new: true }
            )
          await mongoose
            .model('Educations')
            .findByIdAndUpdate(
              tmp._id,
              { $set: { order: education.order } },
              { new: true }
            )
        }
      } else {
        return res.status(200).send({
          success: 2,
          data: null,
          error: null,
          message: 'The course has the lowest order',
        })
      }
    }

    return res.status(200).send({
      success: 1,
      data: null,
      error: null,
      message: 'Course moved successfully',
    })
  } catch (error) {
    next(error)
  }
}
