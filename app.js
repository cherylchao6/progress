//basic setting
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require('cors'); 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
//美化json排版
app.set('json spaces', 2);
const socket = require('./server/controller/socket_controller.js').socket;
socket(io);

// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (token === null) {
//     const err = new Error("未登入");
//     next(err);
//   } else {
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
//       if (err) {
//         const err = new Error("登入逾期");
//         next(err);
//       }
//       console.log(result);
//       let userPicture = await User.selectUserPic(result.id);
//       result.photo = userPicture;
//       result.photoURL= `${process.env.IMAGE_PATH}${userPicture}`;
//       socket.userInfo = result;
//       next();
//     });
//   }
// });

// io.on('connection', async (socket) => {
//   socket.on("checkShareRoom", async (users) => {
//     console.log("server checkShareRoom");
//     console.log(users);
//     let user1RoomList = await ChatModel.selectRoomCount(users[0]);
//     let user2RoomList = await ChatModel.selectRoomCount(users[1]);
//     let user1RoomArr = [];
//     let user2RoomArr = [];
//     for (let j in user1RoomList) {
//       user1RoomArr.push(user1RoomList[j].room_id);
//     };
//     for (let k in user2RoomList) {
//       user2RoomArr.push(user2RoomList[k].room_id);
//     }
//     let shareRoom="no";
//     for (let l in user1RoomArr) {
//       if (user2RoomArr.indexOf(user1RoomArr[l]) !== -1) {
//         shareRoom = user1RoomArr[l];
//       }
//     }
//     console.log(shareRoom);
//     socket.emit("checkShareRoomResult", shareRoom);
//   });
//   socket.on("getRoomMsg", roomID => {
//     console.log("getRoomMsg");
//     ChatModel.updateLastRead(socket, roomID);
//     ChatModel.getRoomMsg(socket,roomID);
//   });
//   //使用者進入聊天室要改成沒有新訊息通知
//   socket.on("inTheChatRoom", async (status) => {
//     console.log("server NoMsgUnread");
//     await ChatModel.allMsgRead(socket.userInfo.id);
//   });
//   socket.on("logOut", async (status) => {
//     console.log("user has log out");
//     await User.logOut(socket.userInfo.id);
//   });
//   //給前端連線者資料
//   socket.emit("userInfo", socket.userInfo);

//   socket.on("createRoom", async (users) => {
//     console.log("create New room in server");
//     let newRoomID = await ChatModel.createRoom(users);
//     let memberInfo = await ChatModel.selectRoomMembersInfo(users);
//     let data = {
//       newRoomID,
//       memberInfo,
//       memberArr: users
//     };
//     //給所有人
//     io.emit('newRoomInvitation',data);
//     socket.emit("newRoomInfo", data);
//   });
//   await ChatModel.selectRooms(socket);
//   //幫使用者檢查有沒有新訊息通知
//   let newMsgStatus = await ChatModel.checkNewMsgUnread(socket.userInfo.id);
//   if (newMsgStatus == "1") {
//     console.log("checknewMsgNotification");
//     socket.emit("checknewMsgNotification", "true");
//   } 


//   socket.on("letMeJoinRoom", newRoomID => {
//     console.log("server let Me Join Room");
//     socket.join(newRoomID.toString());
//   });

    
//   socket.on("sendMsg", async (msgInfo)=>{
//     console.log("new Sent Msg");
//     console.log(msgInfo);
//     //1.存sql則會拿到插入的msgID
//     let insertMsgID = await ChatModel.insertMsg(msgInfo);
//     //2.自己發的訊息一定已讀自己
//     ChatModel.updateLastRead(socket, msgInfo.room_id);
//     //3.如果是群組聊天的話要回傳群組名字跟頭貼
//     let roomNameImg = await ChatModel.selectRoomName(msgInfo.room_id);
//     //即時回傳給所有在聊天室的人
//     msgInfo.source_pic = `${process.env.IMAGE_PATH}${msgInfo.source_pic}`;
//     msgInfo.name = roomNameImg.name;
//     if (roomNameImg.image !== '') {
//       msgInfo.image = `${process.env.IMAGE_PATH}${roomNameImg.image}`;
//     } else {
//       msgInfo.image = roomNameImg.image;
//     } 
//     socket.to((msgInfo.room_id).toString()).emit("newMsg", msgInfo);
//     // 新訊息icon通知
//     // 判斷roomMember在線狀況(不包含自己)
//     let roomMembersOnlineStatus = await ChatModel.selectRoomMembersOnlineStatus(msgInfo.source_id, msgInfo.room_id);
//     let onlineRoomMemberArr = [];
//     let offlineRoomMemberArr = [];
//     for (let j in roomMembersOnlineStatus) {
//       if (RoomMembersOnlineStatus[0].online == "1") {
//         onlineRoomMemberArr.push(roomMembersOnlineStatus[0].user);
//       } else {
//         offlineRoomMemberArr.push(roomMembersOnlineStatus[0].user);
//       }
//     };
//     console.log("check roomber online status");
//     //送新訊息icon通知給在線上的會員 有在線上才能通知
//     for (let i in onlineRoomMemberArr) {
//       let user_id = parseInt(onlineRoomMemberArr[i]);
//       io.emit(`newMsgNotification`, `${user_id}`);
//       await ChatModel.upDateNewMsgUnread(onlineRoomMemberArr[i]);
//     }
//     //不在線上的話要改變new_msg_status改成有新訊息
//     for (let j in offlineRoomMemberArr) {
//       await ChatModel.upDateNewMsgUnread(offlineRoomMemberArr[j]);
//     }  
//   });
  
//   console.log('a user connected');
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
//   ;
// });

server.listen(4000, () => {
  console.log('the server is running on 4000');
});


//Routes:
app.use(require('./server/routes/user'));
app.use(require('./server/routes/diary'));
app.use(require('./server/routes/progress'));


app.use((err, req, res, next)=> {
  console.log(err);
  res.status(500).send({error:err});
});

app.use("*",(req, res, next) => {
  const err = new Error("拍謝！我沒有做這頁欸！");
  err.status = 'fail';
  err.statusCode = 404;
  next(err); // 傳遞error object
});

app.use(function(err, res) {
  console.error(err.stack);
  // return error status and msg to requester
  res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    message: err.message
  });
});




