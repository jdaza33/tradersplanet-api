/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Advertising = new Schema({
  name: { type: String, required: false },
  image: { type: String, required: false },
  imageTwo: { type: String, required: false },
  url: { type: String, required: false },
  urlTwo: { type: String, required: false },
  postId: [{ type: String, required: false, ref: 'Posts' }],
  testimonyId: { type: String, required: true, ref: 'Testimonies' },
  createdBy: { type: String, required: false, ref: 'Users' },
  priority: { type: Boolean, default: false, required: false },
})

Advertising.plugin(timestamp)

module.exports = mongoose.model('Advertisings', Advertising)
