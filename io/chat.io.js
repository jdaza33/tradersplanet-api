/**
 * @description Servicio de socket io para el chat
 */

const socket_io = require("socket.io");
let io = socket_io();
const Testimony = require("../models/testimony");

const changeStream = Testimony.watch();

changeStream.on("change", change => {
  console.log(change);
  io.emit("changeData", change);
});

io.on("connection", function() {
  console.log("connected");
});

var socket = io;
module.exports = socket;
