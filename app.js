//basic setting
const express = require('express');
const app = express();

const path = require('path');

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server)
const ChatModel = require('./server/model/chat_model.js');
const User = require('./server/model/user_model.js');
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
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
      if (err) {
        const err = new Error("登入逾期");
        next(err);
      }
      let userPicture = await User.selectUserPic(result.id);
      result.photo = userPicture;
      result.photoURL= `${process.env.IMAGE_PATH}${userPicture}`;
      socket.userInfo = result;
      next();
    });
  }
});

//全域變數存user 跟 socketid pair 
io.on('connection', async (socket) => {
  //使用者進入聊天室要改成沒有新訊息通知
  socket.on("InTheChatRoom", async (status) => {
    console.log("server NoMsgUnread");
    await ChatModel.NoNewMsgUnread(socket.userInfo.id);
  });
  socket.on("logOut", async(status) =>{
    console.log("user has log out");
    await User.logOut(socket.userInfo.id);
  });
  //給前端連線者資料
  socket.emit("userInfo", socket.userInfo);
  await ChatModel.selectRooms(socket);
  //幫使用者檢查有沒有新訊息通知
  let newMsgStatus = await ChatModel.checkNewMsgUnread(socket.userInfo.id);
  if (newMsgStatus == "1") {
    console.log("checknewMsgNotification");
    socket.emit("checknewMsgNotification", "true");
  } 
  
  socket.on("getRoomMsg", roomID => {
    console.log("getRoomMsg");
    ChatModel.updateLastRead(socket, roomID);
    ChatModel.getRoomMsg(socket,roomID);
  });


  socket.on("createRoom", async (users)=>{
    console.log("create New room in server");
    let newRoomID = await ChatModel.createRoom(users);
    let memberInfo = await ChatModel.selectRoomMembersInfo(users);
    let data = {
      newRoomID,
      memberInfo,
      memberArr: users
    }
    //給所有人
    io.emit('newRoomInvitation',data);
    socket.emit("newRoomInfo", data);
  });

  socket.on("letMeJoinRoom", newRoomID => {
    console.log("server let Me Join Room");
    socket.join(newRoomID.toString());
  });
  socket.on("sendMsg", async (msgInfo)=>{
    console.log("new Sent Msg");
    console.log(msgInfo);
    //1.存sql則會拿到插入的msgID
    let insertMsgID = await ChatModel.insertMsg(msgInfo);
    //2.自己發的訊息一定已讀自己
    ChatModel.updateLastRead(socket, msgInfo.room_id);
    //3.如果是群組聊天的話要回傳群組名字跟頭貼
    let roomNameImg = await ChatModel.selectRoomName(msgInfo.room_id);
    //即時回傳給所有在聊天室的人
    msgInfo.source_pic = `${process.env.IMAGE_PATH}${msgInfo.source_pic}`;
    msgInfo.name = roomNameImg.name;
    if (roomNameImg.image !== '') {
      msgInfo.image = `${process.env.IMAGE_PATH}${roomNameImg.image}`;
    } else {
      msgInfo.image = roomNameImg.image;
    } 
    socket.to((msgInfo.room_id).toString()).emit("newMsg", msgInfo);
    // 新訊息icon通知
    // 判斷roomMember在線狀況(不包含自己)
    let RoomMembersOnlineStatus = await ChatModel.selectRoomMembersOnlineStatus(msgInfo.source_id, msgInfo.room_id);
    let onlineRoomMemberArr = [];
    let offlineRoomMemberArr = [];
    for (let j in RoomMembersOnlineStatus) {
      if (RoomMembersOnlineStatus[0].online == "1") {
        onlineRoomMemberArr.push(RoomMembersOnlineStatus[0].user);
      } else {
        offlineRoomMemberArr.push(RoomMembersOnlineStatus[0].user);
      }
    };
    console.log("check roomber online status");
    //送新訊息icon通知給在線上的會員 有在線上才能通知
    for (let i in onlineRoomMemberArr) {
      let user_id = parseInt(onlineRoomMemberArr[i]);
      io.emit(`newMsgNotification`, `${user_id}`);
      await ChatModel.upDatenewMsgUnread(onlineRoomMemberArr[i]);
    }
    //不在線上的話要改變new_msg_status改成有新訊息
    for (let j in offlineRoomMemberArr) {
      await ChatModel.upDatenewMsgUnread(offlineRoomMemberArr[j]);
    }  
  });
  
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  ;
});



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
const { query, pool } = require('./server/model/mysql');
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

