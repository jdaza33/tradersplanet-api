/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Subscriber = new Schema({
  audienceIds: [{ type: String, required: false, ref: 'Audiences' }],
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true }
})

Subscriber.plugin(timestamp)

module.exports = mongoose.model('Subscribers', Subscriber)
