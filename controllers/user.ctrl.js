/**
 * @description Controlador para el crud de usuarios
 */

'use strict'

//Modules
const mongoose = require('mongoose')
const generator = require('generate-password')
const moment = require('moment')
require('dotenv').config()

//Instanciar el modelo
const User = require('../models/user')

//Utils
const _util_response = require('../utils/response.util')
const _util_security = require('../utils/security.util')

//Services
const serviceNodemailer = require('../services/nodemailer.srv')

module.exports = {
  create,
  get,
  list,
  del,
  edit,
  login,
  setPhoto,
  payCourse,
  resetPassword,
  inviteToSlack,
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
      message: _util_response.getResponse(1, req.headers.iso),
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

    let user = await mongoose
      .model('Users')
      .findById(userId)
      .populate({ path: 'paidcourses' })

    if (!user) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(6, req.headers.iso),
      })
    }

    return res.status(200).send({
      success: 1,
      data: { user },
      error: null,
      message: _util_response.getResponse(4, req.headers.iso),
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

    let users = await mongoose
      .model('Users')
      .find(filters)
      .populate({ path: 'paidcourses' })
      .lean()

    // if (users.length === 0) {
    //   return res.status(200).send({
    //     success: 0,
    //     data: null,
    //     error: _util_response.getResponse(7, req.headers.iso),
    //   })
    // }

    return res.status(200).send({
      success: 1,
      data: { user: users },
      error: null,
      message: _util_response.getResponse(5, req.headers.iso),
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
        error: _util_response.getResponse(6, req.headers.iso),
      })
    }

    // Eliminamos
    await mongoose.model('Users').findByIdAndRemove(userId)

    return res.status(200).send({
      success: 1,
      data: { user },
      error: null,
      message: _util_response.getResponse(3, req.headers.iso),
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
        error: _util_response.getResponse(6, req.headers.iso),
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
      message: _util_response.getResponse(2, req.headers.iso),
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
        error: _util_response.getResponse(11, req.headers.iso),
      })
    }

    if (!data.password || data.password == '') {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(12, req.headers.iso),
      })
    }

    // Buscamos el usuario por email
    let user = await mongoose.model('Users').findOne({ email: data.email })

    if (!user) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(13, req.headers.iso),
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
        error: _util_response.getResponse(10, req.headers.iso),
      })
    }

    //Generamos el token
    let token = _util_security.encodeUser(user._id, user.role)

    return res.status(200).send({
      success: 1,
      data: { user, token },
      error: null,
      message: _util_response.getResponse(8, req.headers.iso),
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

    await mongoose.model('Users').findByIdAndUpdate(userId, {
      photo: `${process.env.ULR}/file/${file.filename}`,
    })

    return res.status(200).send({
      success: 1,
      data: null,
      error: null,
      message: _util_response.getResponse(2, req.headers.iso),
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
        error: _util_response.getResponse(6, req.headers.iso),
      })
    }

    // Eliminamos
    await mongoose.model('Users').findByIdAndUpdate(userId, {
      $push: { paidcourses: courseId },
    })

    return res.status(200).send({
      success: 1,
      data: { user },
      error: null,
      message: _util_response.getResponse(3, req.headers.iso),
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
async function resetPassword(req, res, next) {
  try {
    let { email } = req.body

    let user = await User.findOne(
      { email },
      { _id: 1, email: 1, name: 1 }
    ).lean()

    if (!user)
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(6, req.headers.iso),
      })

    //Generamos la contraseña
    let newPassword = generator.generate({
      length: 6,
      numbers: true,
    })

    //Actualizamos el usuario
    await User.findByIdAndUpdate(user._id, {
      password: _util_security.encryptPassword(newPassword),
    })

    //Enviamos el correo
    await serviceNodemailer.sendMailResetPassword(
      newPassword,
      user.name,
      user.email
    )

    return res.status(200).send({
      success: 1,
      data: { user },
      error: null,
      message: _util_response.getResponse(53, req.headers.iso),
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
async function inviteToSlack(req, res, next) {
  try {
    let userId = req.params.id

    let user = await User.findById(userId, {
      _id: 1,
      name: 1,
      email: 1,
      expireAt: 1,
      subscription: 1,
    }).lean()

    if (user) {
      let days = 0

      if (user.expireAt) {
        let today = moment()
        let expireAt = moment(user.expireAt)
        days = expireAt.diff(today, 'days')
        if (days < 0) days = 0
      }

      //Calculando nuevos dias
      days = parseInt(days) + parseInt(process.env.DAYS_AVAILABLE_SLACK)
      let newExpireAt = moment().add(days, 'days').format('YYYY-MM-DD')

      console.log('days -->', days)
      console.log('newExpireAt', newExpireAt)

      //Actualizamos el usuario
      await User.findByIdAndUpdate(user._id, {
        $set: {
          subscription: true,
          expireAt: newExpireAt,
          subscriptionManual: true,
        },
      })

      await serviceNodemailer.sendMailSlack(user.email, user.name, days)

      return res.status(200).send({
        success: 1,
        data: null,
        error: null,
        message: _util_response.getResponse(62, req.headers.iso),
      })
    } else {
      return res.status(404).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(6, req.headers.iso),
      })
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
}
