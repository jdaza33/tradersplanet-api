/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Payment = new Schema({
  eventStripeId: { type: String, required: true },
  type: { type: String, enum: ['stripe', 'paypal'], required: true },
  userId: { type: String, required: false, ref: 'Users' },
  email: { type: String, required: false },
  amount: { type: Number, required: false },
  objectType: { type: String, required: false },
  objectId: { type: String, required: false },
  reviewed: { type: Boolean, default: false, required: true },
})

Payment.plugin(timestamp)

module.exports = mongoose.model('Payments', Payment)
