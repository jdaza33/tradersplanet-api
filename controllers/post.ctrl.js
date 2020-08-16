/**
 * @description Controlador para el crud de articulos
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Models
const Post = require('../models/post')
const Advertising = require('../models/advertising')

//Utils
const _util_response = require('../utils/response.util')

//Services
const serviceAws = require('../services/aws.srv')

module.exports = {
  create,
  get,
  list,
  del,
  edit,
  setBackground,
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function create(req, res, next) {
  try {
    let data = req.body

    let postCreated = await Post.create(data)

    return res.status(200).send({
      success: 1,
      data: { post: postCreated },
      error: null,
      message: _util_response.getResponse(28, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function get(req, res, next) {
  try {
    let postId = req.params.id

    let post = await Post.findById(postId)
      .populate({
        path: 'author',
        select: '_id name lastname ocupation email role',
      })
      .lean()

    if (!post) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(33, req.headers.iso),
      })
    }

    let ad = await Advertising.find({
      postId,
    })
      .populate({
        path: 'testimonyId',
        select: '_id name email content',
      })
      .lean()
      .sort({ createdAt: -1 })
      .limit(2)

    if (ad.length == 0)
      ad = await Advertising.find({})
        .populate({
          path: 'testimonyId',
          select: '_id name email content',
        })
        .lean()
        .sort({ createdAt: -1 })
        .limit(2)

    post.advertising = ad
    return res.status(200).send({
      success: 1,
      data: { post },
      error: null,
      message: _util_response.getResponse(31, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function list(req, res, next) {
  try {
    let filters = req.body

    let posts = await Post.find(filters)
      .populate({
        path: 'author',
        select: '_id name lastname ocupation email role',
      })
      .sort({ createdAt: -1 })
      .lean()

    let ads = await Advertising.find({})
      .populate({
        path: 'testimonyId',
        select: '_id name email content',
      })
      .lean()
      .sort({ createdAt: -1 })
      .limit(5)

    return res.status(200).send({
      success: 1,
      data: { post: posts, advertising: ads },
      error: null,
      message: _util_response.getResponse(32, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function del(req, res, next) {
  try {
    let postId = req.params.id

    // Verificar si existe dicho id
    let post = await Post.findById(postId)

    if (!post) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(33, req.headers.iso),
      })
    }

    // Eliminamos
    await mongoose.model('Posts').findByIdAndRemove(postId)

    return res.status(200).send({
      success: 1,
      data: { post },
      error: null,
      message: _util_response.getResponse(30, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function edit(req, res, next) {
  try {
    let postId = req.params.id
    let changes = req.body

    // Verificar si existe dicho id
    let post = await Post.findById(postId)

    if (!post) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(33, req.headers.iso),
      })
    }

    let postUpdated = await mongoose
      .model('Posts')
      .findByIdAndUpdate(postId, { $set: changes }, { new: true })

    return res.status(200).send({
      success: 1,
      data: { post: postUpdated },
      error: null,
      message: _util_response.getResponse(29, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function setBackground(req, res, next) {
  try {
    let postId = req.params.id
    let file = req.file

    let files3 = await serviceAws.uploadFileToS3(file, 'posts', postId)

    await Post.findByIdAndUpdate(postId, {
      background: files3.cdn,
    })

    return res.status(200).send({
      success: 1,
      data: null,
      error: null,
      message: _util_response.getResponse(2, req.headers.iso),
    })
  } catch (error) {
    next(error)
  }
}
