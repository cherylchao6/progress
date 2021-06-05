require('dotenv').config();
const { pool } = require('./mysql');



const selectRooms = async (socket) => {
  try{
    let userID = socket.userInfo.id;
    let chatRoomsList = await pool.query(`SELECT room_user.room_id, room.name, room.image, MAX(message.sqltime) AS latest_time FROM room_user JOIN room ON room_user.room_id = room.id JOIN message ON room_user.room_id = message.room_id WHERE user=${userID} GROUP BY message.room_id ORDER BY MAX(message.sqltime) DESC`);
    for (let k in chatRoomsList[0]) {
      let roomID = chatRoomsList[0][k].room_id;
      let MsgArray = await pool.query(`SELECT room_id, source_id, source_name, msg, time, sqltime FROM message WHERE room_id = ${roomID} ORDER BY sqltime DESC`);
      socket.join(roomID.toString());
      let member = await pool.query(`SELECT room_user.room_id, room_user.user, users.name, users.photo FROM room_user JOIN users ON room_user.user = users.id WHERE room_user.room_id = ${roomID}`);
      for (let l in member[0]) {
        member[0][l].photo = `${process.env.IMAGE_PATH}${member[0][l].photo}`;
      }
      // let MsgArray = await pool.query(`SELECT room_id, source_id, source_name, msg, time, sqltime FROM message WHERE room_id = ${roomID} ORDER BY sqltime DESC`);
      let lastReadMsgArr = await pool.query(`SELECT msg_id FROM last_read_msg WHERE room_id=${roomID} AND user_id=${userID}`);
      if (lastReadMsgArr[0].length !== 0) {
        let lastReadMsgID = lastReadMsgArr[0][0].msg_id;
        let lastReadLengthArr = await pool.query(`SELECT COUNT(*) FROM message WHERE room_id=${roomID} AND id > ${lastReadMsgID}`);
        let lastReadMsgNum = lastReadLengthArr[0][0]['COUNT(*)'];
        chatRoomsList[0][k].unReadMsgNum = lastReadMsgNum;
      } else {
        let lastReadMsgNum = MsgArray[0].length;
        chatRoomsList[0][k].unReadMsgNum = lastReadMsgNum;
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
    }
    let roomList = chatRoomsList[0]
    socket.emit("roomList", roomList);
  } catch(err){
    console.log(err);
    return (err);
  }
  
};

//看有無共同房間
const selectRoomCount = async (userID) => {
  try {
    let chatRoomsList = await pool.query(`SELECT room_user.room_id FROM room_user JOIN room ON room_user.room_id = room.id WHERE room_user.user=${userID} AND NOT room.category = "group"`);
    // console.log("------------------------");
    // console.log(chatRoomsList[0]);
    return (chatRoomsList[0]);
  } catch(err){
    console.log(err);
    return (err);
  } 
  
};

const getRoomMsg = async (socket,roomID) => {
  try{
    let roomMsg = await pool.query(`SELECT id, source_id, source_name, source_pic, msg, time FROM message WHERE room_id = ${roomID} ORDER BY sqltime`);
    for (let i in roomMsg[0]) {
      roomMsg[0][i].source_pic = `${process.env.IMAGE_PATH}${roomMsg[0][i].source_pic}`;
    }
    let data = {
      roomID: roomID,
      msg:roomMsg[0]
    };
    socket.emit("getRoomMsg", data);
    } catch(err){
      console.log(err);
      return (err);
    }
};

const updateLastRead = async (socket,roomID) => {
  try {
    let userID = socket.userInfo.id;
    //先選出該聊天室新的一則msg
    let lattestMsgIDArr = await pool.query(`SELECT MAX(id) FROM message WHERE room_id=${roomID}`);
    console.log("last_read");
    console.log(lattestMsgIDArr[0][0]['MAX(id)']);
    let lattestMsgID = lattestMsgIDArr[0][0]['MAX(id)'];
    //update該user的最後一則已讀訊息
    let result = await pool.query(`UPDATE last_read_msg SET msg_id = ${lattestMsgID} WHERE room_id=${roomID} AND user_id=${userID}`);
    console.log(result[0]);
    if (result[0].affectedRows == 0) {
      console.log("insert New Room Last Read");
      let result2 = await pool.query(`INSERT into last_read_msg (room_id, user_id, msg_id) VALUES (${roomID}, ${userID}, ${lattestMsgID})`);
    }
    
  } catch (err) {
    console.log(err);
    return (err);
  }
  
};

const selectRoomMembersOnlineStatus = async (userID, roomID) => {
  try {
    let result = await pool.query(`SELECT room_user.user, users.online FROM room_user JOIN users on users.id = room_user.user WHERE room_user.room_id =${roomID} AND NOT room_user.user=${userID}`);
    return result[0];
  } catch (err) {
    console.log(err);
    return (err);
  }
};

const insertMsg = async (msgInfo) => {
  try {
    let result = await pool.query(`INSERT INTO message (room_id, source_id, source_name, source_pic, msg, time) VALUES (${msgInfo.room_id}, ${msgInfo.source_id}, '${msgInfo.source_name}', '${msgInfo.source_pic}', '${msgInfo.msg}', '${msgInfo.time}')`);
    let insertMsgID = result[0].insertId
    return insertMsgID;
  } catch (err) {
    console.log(err);
    return (err);
  }
};

const selectLastReadMsg = async (roomID, userID) => {
  try {
    let result = await pool.query(`SELECT msg_id FROM last_read_msg WHERE room_id=${roomID} AND user_id=${userID}`);
    let lastReadMsgID = result[0][0].msg_id
    return lastReadMsgID;
  } catch (err) {
    console.log(err);
    return (err);
  }
};

const selectRoomName = async (roomID) => {
  try {
    let result = await pool.query(`SELECT name, image FROM room WHERE id=${roomID}`);
    //{ name: '', image: '' }
    return result[0][0]
  } catch (err) {
    console.log(err);
    return (err);
  }
};

const createRoom = async (users) => {
  try {
    let result = await pool.query(`INSERT INTO room (category) VALUES ("one-one")`);
    let newRoomID = result[0].insertId;
    for (let i in users) {
      let addUserInRoom = await pool.query (`INSERT INTO room_user (room_id, user) VALUES (${newRoomID}, ${users[i]})`);
    }
    return newRoomID;
  } catch (err) {
    console.log(err);
    return (err);
  }
};

const selectRoomMembersInfo = async (users) => {
  try {
    let infoArr = []
    for (let i in users) {
      let result = await pool.query(`SELECT id AS user, name, photo FROM users WHERE id=${users[i]}`);
      result[0][0].photo = `${process.env.IMAGE_PATH}${result[0][0].photo}`;
      infoArr.push(result[0][0]);
    }
    return infoArr;
  } catch (err) {
    console.log(err);
    return (err);
  }
};

//一連線就要告訴他有無新訊息
const checkNewMsgUnread = async (userID) => {
  try {
    console.log('checkNewMsgUnread');
    let result = await pool.query(`SELECT new_msg FROM new_msg_status WHERE user_id = ${userID}`);
    console.log(result[0]);
    return result[0][0].new_msg;
  } catch (err) {
    console.log(err);
    return (err);
  }
};

//離線的人就要告訴他有未讀
const upDatenewMsgUnread = async (userID) => {
  try {
    console.log('upDatenewMsgUnread');
    let result = await pool.query(`UPDATE new_msg_status SET new_msg = '1' WHERE user_id =${userID}`);
  } catch (err) {
    console.log(err);
    return (err);
  }
};

//使用者進入聊天室要改成沒有新訊息通知
const NoNewMsgUnread = async (userID) => {
  try {
    console.log('Model NoNewMsgUnread');
    let result = await pool.query(`UPDATE new_msg_status SET new_msg = '0' WHERE user_id =${userID}`);
    console.log(result[0])
  } catch (err) {
    console.log(err);
    return (err);
  }
};


const createGroupRoom = async (groupRoomData) => {
  try {
    console.log('createGroupRoom');
    console.log(groupRoomData)
    let result = await pool.query(`INSERT INTO room SET?`, groupRoomData);
    console.log(result[0]);
    return result[0].insertId;
  } catch (err) {
    console.log(err);
    return (err);
  }
};


const addGroupChatMember = async (userID, groupRoomID) => {
  try {
    //先檢查該聊天室有沒有超過八個人或重複加入
    let member = await pool.query(`SELECT user FROM room_user WHERE room_id = ${groupRoomID}`)
    console.log(member[0]);
    if (member[0].length == 8) {
      return "群組人數達上限"
    } else {
      //避免重複加入
      let memberArr=[];
      for (let i in member[0]) {
        memberArr.push(member[0][i].user_id);
      } 
      if (memberArr.indexOf(userID.toString()) == -1) {
        let data = {
          room_id: groupRoomID,
          user: userID
        }
        let result  = await pool.query('INSERT INTO room_user SET ?', data);
      }
    }
  } catch (err) {
    console.log(err);
    return (err);
  }
};

const selectGroupRoomInfo = async (groupRoomID) => {
  try {
    console.log('selectGroupRoomInfo controller');
    console.log(groupRoomID)
    let result = await pool.query(`SELECT name, image FROM room WHERE id=${groupRoomID}`);
    console.log(result[0]);
    result[0][0].image = `${process.env.IMAGE_PATH}${result[0][0].image}`;
    return result[0][0];
  } catch (err) {
    console.log(err);
    return (err);
  }
};


module.exports = {
  selectRoomCount,
  selectRooms,
  getRoomMsg,
  updateLastRead,
  selectRoomMembersOnlineStatus,
  insertMsg,
  selectLastReadMsg,
  selectRoomName,
  createRoom,
  selectRoomMembersInfo,
  checkNewMsgUnread,
  upDatenewMsgUnread,
  NoNewMsgUnread,
  createGroupRoom,
  addGroupChatMember,
  selectGroupRoomInfo
};


