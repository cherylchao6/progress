//basic setting
const express = require('express');
const app = express();

const path = require('path');

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server)
const ChatModel = require('./server/model/chat_model.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
//socket 
//middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token === null) {
    const err = new Error("未登入");
    next(err);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) {
        const err = new Error("登入逾期");
        next(err);
      }
      socket.userInfo = result;
      next();
    });
  }
});

io.on('connection', (socket) => {
  // console.log("connect")
  // console.log(socket.userInfo);
  //給前端連線者資料
  socket.emit("userInfo", socket.userInfo);
  ChatModel.selectRooms(socket);


  // socket.on("paging", paging => {
  //   console.log(socket);
  //   console.log(`hear ${paging}`);
    
  // });
  // 拿userID去選出room;
  
  //emit userName
  //登入localstorage放userName
  //room事件
  // 拿userID去選出room;
  // sql拿回來是一個array;
  // sql room Array 
  // [
  //   {
  //     roomid: 1,
        //  room_image: 預設是聊天的對象頭貼網址(若是progress開的群聊就是progrespic);
        //  room_name: 預設是聊天的對象(若是progress開的群聊就是progressName);
        //  lastMessage: gerhabes,
  //        lastMessageTime:ddvcw,
        // },

        //  members:{
        //    1:{
        //      name:趙姿涵,
        //      picture:網址,
        //    }
        //  }

  //     message:[
  //       {msg,
  //        sourse(名字),
  //        time
  //       },
  //       { msg,
  //         sourse,
  //         time
  //        },
  //     ]
        

  //   },
  //   {
  //     roomid: 2,
  //     userPicture:網址,
  //     userName:趙姿涵,
  //     lastMessage: gerhabes,
  //     lastMessageTime:ddvcw
  //   },
  // ]
  // socket.emit("rooms", rooms);


  console.log('a user connected');
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  ;
});


// app.set("io", io);
// const chat = require('./server/model/chat_model.js').chat
// app.get('/chatroom',(req)=>{
//   chat(req);
// })



app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
// app.use('/', express.static('public'));
//美化json排版
app.set('json spaces', 2);



server.listen(4000, () => {
  console.log('the server is running on 4000');
});


//Routes:
app.use(require('./server/routes/user'));
app.use(require('./server/routes/diary'));
app.use(require('./server/routes/progress'));


app.use((err, req, res, next)=> {
  console.log(err);
  res.status(500).send(err);
});

app.use((req, res)=> {
res.sendStatus(404);
});


//fakedata 
const { query } = require('./server/model/mysql');
function getRandom(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
};
app.post('/fakedata', async (req,res)=>{
  //diary table
  let sqlArray1 = [];
  for (let i=0; i<req.query.num; i++) {
    let year = getRandom(2020,2021);
    let mood = getRandom(0,7);
    let index = getRandom(0,5);
    let photoArray = ["cat1.jpeg", "cat2.jpeg", "cat4.jpeg", "cat5.jpeg", "cat6.jpeg", "cat7.jpeg"];
    let monthArray = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let dayArray = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18','19','20','21','22','23','24','25','26','27','28','29','30']
    let index2 = getRandom(0,11);
    let index3 = getRandom(0,29);
    let photo = photoArray[index];
    let month = monthArray[index2];
    let day = dayArray[index3];
    let date = `${year}-${month}-${day}`;
    let diaryArray =[];
    diaryArray.push(1);
    diaryArray.push(date);
    diaryArray.push("iamsososocute");
    diaryArray.push(mood);
    diaryArray.push(photo);
    diaryArray.push(year);
    diaryArray.push(month);
    diaryArray.push(day);
    sqlArray1.push(diaryArray);
  }
  await query('INSERT INTO diary (progress_id, date, content, mood, main_image, year, month, day) VALUES ?', [sqlArray1]);
  //insert diaryData
  let sqlArray2 = [];
  for (let j=1; j < req.query.num/2 + 1; j++) {
    let value = getRandom(100,700);
    let dataArray = [];
    dataArray.push(j);
    dataArray.push('體重');
    dataArray.push(value);
    dataArray.push('kg');
    sqlArray2.push(dataArray);
  }
  for (let k=1; k < req.query.num/2 + 1; k++) {
    let value = getRandom(100,700);
    let dataArray = [];
    dataArray.push(k);
    dataArray.push('腰圍');
    dataArray.push(value);
    dataArray.push('cm');
    sqlArray2.push(dataArray);
  };

  for (let l=1; l < req.query.num/2 + 1; l++) {
    let value = getRandom(100,700);
    let dataArray = [];
    dataArray.push(req.query.num/2 + l);
    dataArray.push('體重');
    dataArray.push(value);
    dataArray.push('kg');
    sqlArray2.push(dataArray);
  }

  for (let m=1; m < req.query.num/2 + 1; m++) {
    let value = getRandom(100,700);
    let dataArray = [];
    dataArray.push(req.query.num/2 + m);
    dataArray.push('腰圍');
    dataArray.push(value);
    dataArray.push('cm');
    sqlArray2.push(dataArray);
  }

  await query('INSERT INTO diary_data (diary_id, name, value, unit) VALUES ?', [sqlArray2]);
  
  res.send("hihihi")
});

