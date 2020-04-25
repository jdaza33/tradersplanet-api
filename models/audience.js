/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Audience = new Schema({
  name: { type: String, required: true },
  webId: { type: Number, required: true },
  idMailchimp: { type: String, required: true },
})

Audience.plugin(timestamp)

module.exports = mongoose.model('Audiences', Audience)
