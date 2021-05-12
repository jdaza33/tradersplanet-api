/**
 * @description Utilidad para el manejo de seguridad, tokens y encriptacion
 */

'use strict'

// Modules
const bcrypt = require('bcryptjs')
const jwt = require('jwt-simple')

module.exports = {
  encryptPassword,
  comparePassword,
  encodeUser,
  decodeToken
}

/**
 *
 * @param {Clave sin encriptar} password
 */
function encryptPassword(password) {
  try {
    let salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
  } catch (error) {
    console.log(error)
  }
}

/**
 *
 * @param {Clave sin encriptar} password
 * @param {Clave encriptada} hash
 */
function comparePassword(password, hash) {
  try {
    return bcrypt.compareSync(password, hash)
  } catch (error) {
    console.log(error)
  }
}

/**
 *
 * @param {Identificador del usuario} userId
 * @param {Rol del usuario} role
 */
function encodeUser(userId, role) {
  try {
    let payload = {
      id: userId,
      role,
      exp: 1440 //min
    }
    return jwt.encode(payload, process.env.SECRET_JWT)
  } catch (error) {
    console.log(error)
  }
}

/**
 *
 * @param {*} token
 */
function decodeToken(token) {
  try {
    return jwt.decode(token, process.env.SECRET_JWT)
  } catch (error) {
    console.log(error)
  }
}
