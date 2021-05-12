/**
 *@description Esquema de suscripciones
 */

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Payments = new Schema({
  price: { type: Number, required: true },
  type: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'singlePayment'],
    required: true,
  },
})

const Subscription = new Schema({
  name: { type: String, required: true },
  features: { type: [String], required: false },
  payments: { type: [Payments], required: true },
  active: { type: Boolean, default: true, required: true },
  createdAt: { type: Number, required: true }, //Fecha en milisegundos
  createdBy: { type: String, required: false, trim: true, ref: 'Users' },
})

module.exports = mongoose.model('Subscriptions', Subscription)
