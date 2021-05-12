/**
 * @description Controlador para el crud de webhook de mailchimp
 */

'use strict'

//Modules
const mongoose = require('mongoose')
const moment = require('moment')

//Instanciar el modelo
const Subscriber = require('../models/subscriber')
const Audience = require('../models/audience')
const Payment = require('../models/payment')
const User = require('../models/user')

//Services
const serviceMailchimp = require('../services/mailchimp.srv')
const serviceNodemailer = require('../services/nodemailer.srv')

//Utils
const _util_response = require('../utils/response.util')

module.exports = {
  main,
  stripe,
  taskStripeCourse,
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function main(req, res, next) {
  try {
    let { type, data } = req.body
    let email = data.email
    let audienceId = data.list_id
    let name = data.merges.FNAME

    if (type == 'subscribe') {
      let user = await Subscriber.findOne({ email })
      if (user) {
        let audiences = user.audienceIds ? user.audienceIds : []
        if (!audiences.includes(audienceId))
          await Subscriber.findOneAndUpdate(
            { email },
            { $push: { audienceIds: audienceId } }
          )
      } else
        await Subscriber.create({
          name,
          email,
          audienceIds: [audienceId],
        })
    }

    if (type == 'unsubscribe') {
      let user = await Subscriber.findOne({ email })
      if (user) {
        let audiences = user.audienceIds ? user.audienceIds : []
        if (audiences.includes(audienceId))
          await Subscriber.findOneAndUpdate(
            { email },
            { $pull: { audienceIds: audienceId } }
          )
      }
    }

    return res.status(200).send({
      success: 1,
      error: null,
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
async function stripe(req, res, next) {
  try {
    let event = req.body

    let idEvent = event.id
    let typeEvent = event.type
    let dataEvent = event.data.object
    let emailUser = dataEvent.receipt_email
    let amount = dataEvent.amount
    let metadata = dataEvent.metadata

    if (typeEvent == 'charge.succeeded') {
      console.log('---- RECIBIENDO NUEVO PAGO ----')

      console.log('id --> ', idEvent)
      console.log('type --> ', typeEvent)
      // console.log(dataEvent)
      console.log('metadata --> ', metadata)
      console.log('email --> ', emailUser)
      console.log('---------------\n\n')

      //Buscamos el usuario
      let user = await User.findOne({ email: emailUser }, { _id: 1 }).lean()

      //Construimos la data
      let data = {
        amount,
        eventStripeId: idEvent,
        objectType: metadata.objectType,
        objectId: metadata.objectId,
        type: 'stripe',
      }

      if (user) data.userId = user._id.toString()
      else data.email = emailUser

      //Insertamos la data
      let createdPayment = await Payment.create(data)
    }

    return res.status(200).send({
      success: 1,
      error: null,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

/**
 * @description Tarea para añadir dias y fecha de expiracion a usuarios con pagos nuevos
 */
function taskStripeCourse() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('----------- INICIANDO TAREA DE PAGOS -----------')

      //Buscamos los pagos no vistos
      let payments = await Payment.find({ reviewed: false }).lean()

      console.log('pagos ---> ', payments.length)

      for (let pay of payments) {
        console.log('Pago ID: ', pay._id)

        //Buscamos el usuario
        let user = null

        if (pay.userId) {
          user = await User.findOne(
            {
              userId: pay.userId,
            },
            { _id: 1, subscription: 1, expireAt: 1, paidcourses: 1 }
          ).lean()
        } else {
          user = await User.findOne(
            {
              email: pay.email,
            },
            {
              _id: 1,
              subscription: 1,
              expireAt: 1,
              paidcourses: 1,
              email: 1,
              name: 1,
            }
          ).lean()
        }

        console.log('user', user)

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
            },
          })

          // //Actualizamos el pago
          await Payment.findByIdAndUpdate(pay._id, {
            $set: {
              reviewed: true,
            },
          })

          await serviceNodemailer.sendMailSlack(user.email, user.name, days)
        }
      }
      console.log('----------- FINALIZANDO TAREA DE PAGOS -----------')

      resolve()
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}
