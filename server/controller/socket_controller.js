const ChatModel = require("../model/chat_model.js");
const User = require("../model/user_model.js");
const jwt = require("jsonwebtoken");

function socket (io) {
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
        const userPicture = await User.selectUserPic(result.id);
        result.photo = userPicture;
        result.photoURL = `${process.env.IMAGE_PATH}${userPicture}`;
        socket.userInfo = result;
        next();
      });
    }
  });

  io.on("connection", async (socket) => {
    socket.on("checkShareRoom", async (users) => {
      const user1RoomList = await ChatModel.selectRoomCount(users[0]);
      const user2RoomList = await ChatModel.selectRoomCount(users[1]);
      const user1RoomArr = [];
      const user2RoomArr = [];
      for (const j in user1RoomList) {
        user1RoomArr.push(user1RoomList[j].room_id);
      };
      for (const k in user2RoomList) {
        user2RoomArr.push(user2RoomList[k].room_id);
      }
      let shareRoom = "no";
      for (const l in user1RoomArr) {
        if (user2RoomArr.indexOf(user1RoomArr[l]) !== -1) {
          shareRoom = user1RoomArr[l];
        }
      }
      socket.emit("checkShareRoomResult", shareRoom);
    });
    socket.on("letMeJoinRoom", newRoomID => {
      socket.join(newRoomID.toString());
    });
    socket.on("getRoomMsg", roomID => {
      ChatModel.updateLastRead(socket, roomID);
      ChatModel.getRoomMsg(socket, roomID);
    });
    // 使用者進入聊天室要改成沒有新訊息通知
    socket.on("inTheChatRoom", async (status) => {
      await ChatModel.allMsgRead(socket.userInfo.id);
    });
    socket.on("logOut", async (status) => {
      await User.logOut(socket.userInfo.id);
    });
    // 給前端連線者資料
    socket.emit("userInfo", socket.userInfo);

    socket.on("createRoom", async (users) => {
      const newRoomID = await ChatModel.createRoom(users);
      const memberInfo = await ChatModel.selectRoomMembersInfo(users);
      const data = {
        newRoomID,
        memberInfo,
        memberArr: users
      };
      // 給所有人
      io.emit("newRoomInvitation", data);
      socket.emit("newRoomInfo", data);
    });
    await ChatModel.selectRooms(socket);
    // 幫使用者檢查有沒有新訊息通知
    const newMsgStatus = await ChatModel.checkNewMsgUnread(socket.userInfo.id);
    if (newMsgStatus == "1") {
      console.log("checknewMsgNotification");
      socket.emit("checknewMsgNotification", "true");
    }

    socket.on("sendMsg", async (msgInfo) => {
      // 自己發的訊息一定已讀自己
      console.log(msgInfo);
      // msg存sql
      await ChatModel.insertMsg(msgInfo);
      ChatModel.updateLastRead(socket, msgInfo.room_id);
      // 如果是群組聊天的話要回傳群組名字跟頭貼
      const roomNameImg = await ChatModel.selectRoomName(msgInfo.room_id);
      // 即時回傳給所有在聊天室的人
      msgInfo.source_pic = `${process.env.IMAGE_PATH}${msgInfo.source_pic}`;
      msgInfo.name = roomNameImg.name;
      if (roomNameImg.image !== "") {
        msgInfo.image = `${process.env.IMAGE_PATH}${roomNameImg.image}`;
      } else {
        msgInfo.image = roomNameImg.image;
      }
      socket.to((msgInfo.room_id).toString()).emit("newMsg", msgInfo);
      // 新訊息icon通知
      // 判斷roomMember在線狀況(不包含自己)
      const roomMembersOnlineStatus = await ChatModel.selectRoomMembersOnlineStatus(msgInfo.source_id, msgInfo.room_id);
      const onlineRoomMemberArr = [];
      const offlineRoomMemberArr = [];
      for (const j in roomMembersOnlineStatus) {
        if (roomMembersOnlineStatus[0].online == "1") {
          onlineRoomMemberArr.push(roomMembersOnlineStatus[0].user);
        } else {
          offlineRoomMemberArr.push(roomMembersOnlineStatus[0].user);
        }
      };
      // 送新訊息icon通知給在線上的會員 有在線上才能通知
      for (const i in onlineRoomMemberArr) {
        const user_id = parseInt(onlineRoomMemberArr[i]);
        io.emit("newMsgNotification", `${user_id}`);
        await ChatModel.upDateNewMsgUnread(onlineRoomMemberArr[i]);
      }
      // 不在線上的話要改變new_msg_status改成有新訊息
      for (const j in offlineRoomMemberArr) {
        await ChatModel.upDateNewMsgUnread(offlineRoomMemberArr[j]);
      }
    });
    console.log("a user connected");
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    ;
  });
}

module.exports = {
  socket
};
