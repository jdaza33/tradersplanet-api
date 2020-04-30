/**
 * Servicio de envio de correo
 */

'use strict'
const nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid')
const ejs = require('ejs')
const path = require('path')
require('dotenv').config()

module.exports = {
  sendMail,
  sendMailResetPassword
}

function sendMail(subject, text, name, email) {
  return new Promise(async (resolve, reject) => {
    try {
      const transport = nodemailer.createTransport(
        nodemailerSendgrid({
          apiKey: process.env.KEY_SENDGRID,
        })
      )

      let template = await ejs.renderFile(
        path.join(__dirname, '../utils/templates/' + 'info.ejs'),
        {
          nombre: name,
          asunto: subject,
          email,
          mensaje: text,
        }
      )

      let attachments = [
        {
          filename: 'logo.png',
          path: path.join(__dirname, '../utils/images/logo.png'),
          cid: 'logo@cid',
        },
      ]

      let info = await transport.sendMail({
        from: '"Admin 👻" <admin@tradersplanet.us>',
        // from: 'admin@tradersplanet.us',
        // to: 'info@tradersplanet.us',
        to: 'blackencio33@gmail.com',
        subject,
        html: template,
        attachments,
      })

      await transport.close()

      console.log('Correo enviado con exito.')
      console.log('Message sent: %s', info.messageId)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

      resolve()
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

function sendMailResetPassword(password, name, email) {
  return new Promise(async (resolve, reject) => {
    try {
      const transport = nodemailer.createTransport(
        nodemailerSendgrid({
          apiKey: process.env.KEY_SENDGRID,
        })
      )

      let template = await ejs.renderFile(
        path.join(__dirname, '../utils/templates/' + 'reset-password.ejs'),
        {
          name,
          password,
        }
      )

      let attachments = [
        {
          filename: 'logo.png',
          path: path.join(__dirname, '../utils/images/logo.png'),
          cid: 'logo@cid',
        },
      ]

      let info = await transport.sendMail({
        from: '"Admin 👻" <admin@tradersplanet.us>',
        // from: 'admin@tradersplanet.us',
        // to: 'info@tradersplanet.us',
        to: email,
        subject: 'Restablecer contraseña - Traders Planet',
        html: template,
        attachments,
      })

      await transport.close()

      console.log('Correo enviado con exito.')
      console.log('Message sent: %s', info.messageId)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

      resolve()
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}
