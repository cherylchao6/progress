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
// 美化json排版
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
  next(err); // 傳遞error object
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

// // test
// require("dotenv").config();
// const { pool } = require("./server/model/mysql");
// test();
// async function test () {
//   const IDArr = [];
//   const diaryIDArr = [];
//   const result = await pool.query("SELECT DISTINCT room_id FROM room_user");
//   const result2 = await pool.query("SELECT id FROM room");
//   console.log(result[0]);
//   console.log(result2[0]);
//   for (const i in result[0]) {
//     diaryIDArr.push(result[0][i].room_id);
//   }
//   for (const i in result2[0]) {
//     IDArr.push(result2[0][i].id);
//   }
//   const result3 = diaryIDArr.filter((e) => {
//     return IDArr.indexOf(e) === -1;
//   });
//   console.log(result3);
// }
