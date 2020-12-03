/**
 * @descripcion Servicio de stripe
 */

'use strict'

require('dotenv').config()

const stripe = require('stripe')(
  process.env.NODE_ENV == 'production'
    ? process.env.KEY_SECRET_STRIPE
    : process.env.TEST_KEY_SECRET_STRIPE
)
console.log(process.env.NODE_ENV)

module.exports = {
  newPayment,
  newPaymentWithSource,
  newPaymentCheckout,
  getSessionId,
}

function newPayment(data) {
  return new Promise(async (resolve, reject) => {
    try {
      //Create token
      let token = await stripe.tokens.create({
        card: {
          number: data.numbercard,
          exp_month: parseInt(data.monthcard),
          exp_year: data.yearcard,
          cvc: data.cvccard,
          name: data.name,
        },
      })

      let charge = await stripe.charges.create({
        amount: Math.round(data.amount * 100),
        currency: 'usd',
        source: token.id,
        receipt_email: data.email,
        description: data.description,
      })

      resolve(charge)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

function newPaymentWithSource(data) {
  return new Promise(async (resolve, reject) => {
    try {
      let charge = await stripe.charges.create({
        amount: Math.round(data.amount * 100),
        currency: 'usd',
        source: data.source,
        receipt_email: data.email,
        description: data.description,
        metadata: {
          objectType: data.type,
          objectId: data.typeId,
        },
      })

      resolve(charge)
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })
}

function newPaymentCheckout(data) {
  return new Promise(async (resolve, reject) => {
    try {
      let session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            name: data.name,
            images: [data.image],
            amount: data.price,
            currency: 'usd',
            quantity: 1,
          },
        ],
        success_url: data.success_url,
        cancel_url: data.cancel_url,
      })
      return resolve(session)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}

/**
 *
 * @param {string} sessionId
 */
function getSessionId(sessionId) {
  return new Promise(async (resolve, reject) => {
    try {
      let session = await stripe.checkout.sessions.retrieve(sessionId)
      return resolve(session)
    } catch (error) {
      console.log(error)
      return reject(error)
    }
  })
}
