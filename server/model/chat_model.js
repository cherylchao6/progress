require('dotenv').config();
const { pool } = require('./mysql');


const selectRooms = async (socket) => {
  let userID = socket.userInfo.id;
  let chatRoomsList = await pool.query(`SELECT room_user.room_id, room.name, room.image, MAX(message.sqltime) AS latest_time FROM room_user JOIN room ON room_user.room_id = room.id JOIN message ON room_user.room_id = message.room_id WHERE user=${userID} GROUP BY message.room_id ORDER BY message.sqltime DESC`);
  for (let k in chatRoomsList[0]) {
    let roomID = chatRoomsList[0][k].room_id;
    let member = await pool.query(`SELECT room_user.room_id, room_user.user, users.name, users.photo FROM room_user JOIN users ON room_user.user = users.id WHERE room_user.room_id = ${roomID}`);
    for (let l in member[0]) {
      member[0][l].photo = `${process.env.IMAGE_PATH}${member[0][l].photo}`;
    }
    let MsgArray = await pool.query(`SELECT room_id, source_id, source_name, msg, time, sqltime FROM message WHERE room_id = ${roomID} ORDER BY sqltime DESC`);
    let readStatusArray = await pool.query(`SELECT room_id, status, COUNT(*) FROM message WHERE room_id = ${roomID} AND status = 0 GROUP BY status;`);
    if (readStatusArray[0].length > 0) {
      let unReadStatusLength = readStatusArray[0][0]['COUNT(*)'];
      chatRoomsList[0][k].unReadMsgNum = unReadStatusLength;
    } else {
      chatRoomsList[0][k].unReadMsgNum = 0;
    } 
    let latestMsg = MsgArray[0][0];
    chatRoomsList[0][k].sourceID = latestMsg.source_id;
    chatRoomsList[0][k].sourceName = latestMsg.source_name;

    chatRoomsList[0][k].latestMsg = latestMsg.msg;
    chatRoomsList[0][k].latestTime = latestMsg.time;
    if (chatRoomsList[0][k].image !== "") {
      chatRoomsList[0][k].image = `${process.env.IMAGE_PATH}${chatRoomsList[0][k].image}`;
    }
    chatRoomsList[0][k].member = member[0];
    // console.log(chatRoomsList[0][k]);
  }
  // console.log(chatRoomsList[0]);
  let roomList = chatRoomsList[0]
  socket.emit("roomList", roomList);
};

const selectRoomCount = async (userID) => {
  let chatRoomsList = await pool.query(`SELECT room_user.room_id FROM room_user JOIN room ON room_user.room_id = room.id WHERE room_user.user=${userID} AND NOT room.category = "group"`);
  // console.log("------------------------");
  // console.log(chatRoomsList[0]);
  return (chatRoomsList[0]);
};

const getRoomMsg = async (roomID) => {
  console.log(roomID);
  let roomMsg = await pool.query(`SELECT source_id, source_name, msg, time WHERE room_id = ${roomID} ORDER BY sqltime`);
  console.log(roomMsg[0]);

  console.log("------------------------");
};



module.exports = {
  selectRoomCount,
  selectRooms,
  getRoomMsg
};


