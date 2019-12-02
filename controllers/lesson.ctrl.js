/**
 * @description Controlador para el crud de clases
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Instanciar el modelo
const Lesson = require('../models/lesson')

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

    //Creamos la clase
    let lessonCreated = await mongoose.model('Lessons').create(data)

    return res.status(200).send({
      success: 1,
      data: { lesson: lessonCreated },
      error: null,
      message: _util_response.getResponse(14, req.headers.iso)
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
    let lessonId = req.params.id

    let lesson = await mongoose.model('Lessons').findById(lessonId)

    if (!lesson) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(19, req.headers.iso)
      })
    }

    return res.status(200).send({
      success: 1,
      data: { lesson },
      error: null,
      message: _util_response.getResponse(17, req.headers.iso)
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

    let lessons = await mongoose.model('Lessons').find(filters)

    if (lessons.length === 0) {
      return res.status(200).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(20, req.headers.iso)
      })
    }

    return res.status(200).send({
      success: 1,
      data: { lesson: lessons },
      error: null,
      message: _util_response.getResponse(18, req.headers.iso)
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
    let lessonId = req.params.id

    // Verificar si existe dicho id
    let lesson = await mongoose.model('Lessons').findById(lessonId)

    if (!lesson) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(19, req.headers.iso)
      })
    }

    // Eliminamos
    await mongoose.model('Lessons').findByIdAndRemove(lessonId)

    return res.status(200).send({
      success: 1,
      data: { lesson },
      error: null,
      message: _util_response.getResponse(16, req.headers.iso)
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
    let lessonId = req.params.id
    let changes = req.body

    // Verificar si existe dicho id
    let lesson = await mongoose.model('Lessons').findById(lessonId)

    if (!lesson) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(19, req.headers.iso)
      })
    }

    let lessonUpdated = await mongoose
      .model('Lessons')
      .findByIdAndUpdate(lessonId, { $set: changes }, { new: true })

    return res.status(200).send({
      success: 1,
      data: { lesson: lessonUpdated },
      error: null,
      message: _util_response.getResponse(15, req.headers.iso)
    })
  } catch (error) {
    next(error)
  }
}
