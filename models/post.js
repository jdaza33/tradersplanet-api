/**
 * 
 */

const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const Schema = mongoose.Schema

const Post = new Schema({
    title: String,
    contentHtml: String,
    contentText: String,
    author: { type: String, ref: 'Users' },
    tags: [String],
    background: String,
    public: Boolean
})

Post.plugin(timestamp)

module.exports = mongoose.model('Posts', Post)
