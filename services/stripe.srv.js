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

module.exports = { newPayment }

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
