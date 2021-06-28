/**
 * @description Esquema de pagos
 */

const mongoose = require('mongoose')
// const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Pay = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['stripe', 'paypal', 'manual'], required: true },
})

const PayFor = new Schema({
  id: { type: String, required: true },
  payFor: {
    type: String,
    enum: ['subscription', 'education', 'service', 'other'],
    trim: true,
    required: true,
  },
  descriptionPayForOther: { type: String, trim: true, required: false },
})

const Payment = new Schema({
  pay: { type: Pay, required: true },
  userId: { type: String, required: false, trim: true, ref: 'Users' },
  emailPayment: { type: String, trim: true, lowercase: true, required: false },
  amount: { type: Number, required: true },
  payFor: { type: PayFor, required: true },
  createdAt: { type: Number, required: true }, //Fecha en milisegundos
  expireAt: { type: Number, required: false }, //Fecha en milisegundos // 0 no expira
  createdBy: { type: String, required: false, trim: true, ref: 'Users' },
  // reviewed: { type: Boolean, default: false, required: true },
})

// Payment.plugin(timestamp)

module.exports = mongoose.model('Payments', Payment)
