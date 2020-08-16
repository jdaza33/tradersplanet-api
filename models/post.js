/**
 *
 */

const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const Schema = mongoose.Schema

const Post = new Schema({
  title: String,
  contentHtml: String,
  contentText: {
    type: String,
    maxlength: 230,
    required: false,
  },
  author: { type: String, ref: 'Users' },
  tags: [String],
  background: String,
  public: Boolean,
  class: String,
})

Post.plugin(timestamp)

module.exports = mongoose.model('Posts', Post)
