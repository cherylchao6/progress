// basic setting
require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require("cors");
app.use(cors());
// socket
const socket = require("./server/controller/socket_controller.js").socket;
socket(io);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.set("json spaces", 2);

server.listen(4000, () => {
  console.log("the server is running on 4000");
});

// Routes:
app.use(require("./server/routes/user"));
app.use(require("./server/routes/diary"));
app.use(require("./server/routes/progress"));

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ error: err });
});

app.use("*", (req, res, next) => {
  const err = new Error("拍謝！我沒有做這頁欸！");
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  // return error status and msg to requester
  res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    message: err.message
  });
});

module.exports = app;
