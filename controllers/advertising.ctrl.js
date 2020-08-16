/**
 * @description Controlador para el crud de publicidades
 */

'use strict'

//Modules
const mongoose = require('mongoose')

//Instanciar el modelo
const Advertising = require('../models/advertising')
const Post = require('../models/post')

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
  setImage,
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

    let adCreated = await Advertising.create(data)

    return res.status(200).send({
      success: 1,
      data: { advertising: adCreated },
      error: null,
      message: _util_response.getResponse(55, req.headers.iso),
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
    let adId = req.params.id

    let advertising = await Advertising.findById(adId)

    if (!advertising) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: null,
        message: _util_response.getResponse(56, req.headers.iso),
      })
    }

    return res.status(200).send({
      success: 1,
      data: { advertising },
      error: null,
      message: _util_response.getResponse(57, req.headers.iso),
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

    let advertisings = await Advertising.find(filters)
      .populate(
        // {
        //   path: 'postId',
        //   select: '_id title',
        // },
        {
          path: 'testimonyId',
          select: '_id name email content',
        }
      )
      .lean()

    //Find posts
    let posts = []
    for (let ad of advertisings) posts = [...posts, ...ad.postId]

    let findPosts = await Post.find(
      { _id: { $in: posts } },
      { _id: 1, title: 1 }
    ).lean()

    advertisings = advertisings.map((a) => {
      let tmp = { ...a }
      if (tmp.testimonyId)
        tmp.testimonyId.abrv = `${
          tmp.testimonyId.name
        }: ${tmp.testimonyId.content.substring(0, 50)}`

      tmp.postId = findPosts.filter((f) =>
        tmp.postId.includes(f._id.toString())
      )
      return tmp
    })

    return res.status(200).send({
      success: 1,
      data: { advertising: advertisings },
      error: null,
      message: _util_response.getResponse(59, req.headers.iso),
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
    let adId = req.params.id

    // Verificar si existe dicho id
    let advertising = await Advertising.findById(adId)

    if (!advertising) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(56, req.headers.iso),
      })
    }

    // Eliminamos
    await Advertising.findByIdAndRemove(adId)

    return res.status(200).send({
      success: 1,
      data: { advertising },
      error: null,
      message: _util_response.getResponse(60, req.headers.iso),
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
    let adId = req.params.id
    let changes = req.body

    // Verificar si existe dicho id
    let advertising = await Advertising.findById(adId)

    if (!advertising) {
      return res.status(403).send({
        success: 0,
        data: null,
        error: _util_response.getResponse(56, req.headers.iso),
      })
    }

    let adUpdated = await Advertising.findByIdAndUpdate(
      adId,
      { $set: changes },
      { new: true }
    )

    return res.status(200).send({
      success: 1,
      data: { advertising: adUpdated },
      error: null,
      message: _util_response.getResponse(61, req.headers.iso),
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
async function setImage(req, res, next) {
  try {
    let adId = req.params.id
    let op = req.params.op
    op = parseInt(op)
    let file = req.file

    let files3 = await serviceAws.uploadFileToS3(
      file,
      'advertising',
      `${adId}_${op}`
    )

    if (op == 1)
      await Advertising.findByIdAndUpdate(adId, {
        image: files3.cdn,
      })
    else
      await Advertising.findByIdAndUpdate(adId, {
        imageTwo: files3.cdn,
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
