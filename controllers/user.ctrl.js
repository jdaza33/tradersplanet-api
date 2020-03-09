/**
 * @description Controlador para el crud de usuarios
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Instanciar el modelo
const User = require('../models/user')

//Utils
const _util_response = require('../utils/response.util')
const _util_security = require('../utils/security.util')

module.exports = {
  create,
  get,
  list,
  del,
  edit,
  login,
  setPhoto,
  payCourse
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

    if (!data.password || data.password == '') {
      data.password = '12345'
    }

    //En caso de que no venga un rol, se le asigna el rol mas bajo
    if (!data.role) {
      data.role = 'auditor'
    }

    //Encriptamos la clave
    data.password = _util_security.encryptPassword(data.password)

    //Creamos el usuario
    let userCreated = await mongoose.model('Users').create(data)

    return res.status(200).send({
      success: 1,
      data: { user: userCreated },
      error: null,
      message: _util_response.getResponse(1, req.headers.iso)
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
    let userId = req.params.id

    let user = await mongoose.model('Users').findById(userId)

    if (!user) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(6, req.headers.iso)
      })
    }

    return res.status(200).send({
      success: 1,
      data: { user },
      error: null,
      message: _util_response.getResponse(4, req.headers.iso)
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

    let users = await mongoose.model('Users').find(filters)

    if (users.length === 0) {
      return res.status(200).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(7, req.headers.iso)
      })
    }

    return res.status(200).send({
      success: 1,
      data: { user: users },
      error: null,
      message: _util_response.getResponse(5, req.headers.iso)
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
    let userId = req.params.id

    // Verificar si existe dicho id
    let user = await mongoose.model('Users').findById(userId)

    if (!user) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(6, req.headers.iso)
      })
    }

    // Eliminamos
    await mongoose.model('Users').findByIdAndRemove(userId)

    return res.status(200).send({
      success: 1,
      data: { user },
      error: null,
      message: _util_response.getResponse(3, req.headers.iso)
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
    let userId = req.params.id
    let changes = req.body

    //Eliminamos los createdAt y updatedAt
    delete changes.createdAt
    delete changes.updatedAt

    // Verificar si existe dicho id
    let user = await mongoose.model('Users').findById(userId)

    if (!user) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(6, req.headers.iso)
      })
    }

    //Verificamos si cambio la contraseña
    if (changes && changes.password) {
      if (changes.password != user.password) {
        //Encriptamos la clave
        changes.password = _util_security.encryptPassword(changes.password)
      }
    }

    let userUpdate = await mongoose
      .model('Users')
      .findByIdAndUpdate(userId, { $set: changes }, { new: true })

    return res.status(200).send({
      success: 1,
      data: { user: userUpdate },
      error: null,
      message: _util_response.getResponse(2, req.headers.iso)
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
async function login(req, res, next) {
  try {
    let data = req.body

    if (!data.email || data.email == '') {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(11, req.headers.iso)
      })
    }

    if (!data.password || data.password == '') {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(12, req.headers.iso)
      })
    }

    // Buscamos el usuario por email
    let user = await mongoose.model('Users').findOne({ email: data.email })

    if (!user) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(13, req.headers.iso)
      })
    }

    //Comparamos la contraseña
    let comparePassword = _util_security.comparePassword(
      data.password,
      user.password
    )
    if (!comparePassword) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(10, req.headers.iso)
      })
    }

    //Generamos el token
    let token = _util_security.encodeUser(user._id, user.role)

    return res.status(200).send({
      success: 1,
      data: { user, token },
      error: null,
      message: _util_response.getResponse(8, req.headers.iso)
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
async function setPhoto(req, res, next) {
  try {
    let userId = req.params.id
    let file = req.file

    await mongoose
      .model('Users')
      .findByIdAndUpdate(userId, { photo: `${process.env.ULR}/file/${file.filename}` })

    return res.status(200).send({
      success: 1,
      data: null,
      error: null,
      message: _util_response.getResponse(2, req.headers.iso)
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
async function payCourse(req, res, next) {
  try {
    let userId = req.params.id
    let courseId = req.params.courseId

    // Verificar si existe dicho id
    let user = await mongoose.model('Users').findById(userId)

    if (!user) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(6, req.headers.iso)
      })
    }

    // Eliminamos
    await mongoose.model('Users').findByIdAndUpdate(userId, {
      $push: { paidcourses: courseId }
    })

    return res.status(200).send({
      success: 1,
      data: { user },
      error: null,
      message: _util_response.getResponse(3, req.headers.iso)
    })
  } catch (error) {
    next(error)
  }
}
