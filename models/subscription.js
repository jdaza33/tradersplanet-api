/**
 *@description Esquema de suscripciones
 */

//Modules
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Payments = new Schema({
  price: { type: Number, required: true },
  type: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'singlePayment'],
    required: true,
  },
  priceId: { type: String, required: false },
})

const Subscription = new Schema({
  name: { type: String, required: true },
  features: { type: [String], required: false },
  payments: { type: [Payments], required: true },
  active: { type: Boolean, default: true, required: true },
  createdAt: { type: Number, required: true }, //Fecha en milisegundos
  createdBy: { type: String, required: false, trim: true, ref: 'Users' },
  stripeId: { type: String, trim: true },
  readyForSell: { type: Boolean, default: true, required: false },
})

Subscription.post('save', async function (doc, next) {
  try {
    const {
      createProduct,
      createPriceProduct,
    } = require('../services/stripe.srv')
    const { id } = await createProduct('subscription', doc)
    await createPriceProduct(id, 'subscription', null, doc)
    next()
  } catch (error) {
    console.log(error)
    return error
  }
})

module.exports = mongoose.model('Subscriptions', Subscription)
