const User = require('../model/user_model.js');
const ChatModel = require('../model/chat_model.js');

const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let result = await User.signUp(name, email, password);  
      
    if (result.msg) {
      res.sendStatus(403);
      return;
    }
    
    res.status(200).send({
      data : {
        access_token : result.token,
        user: {
          id: result.id,
          name: result.name,
          email: result.email,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let result = await User.signIn(email, password);

    //帳號或密碼錯誤
    if (result.error == 'user is not registered') {
      res.sendStatus(401);
      return;
    } else if (result.error == 'password is wrong') {
      res.sendStatus(403);
      return;
    }
      res.status(200).send({
        data : {
          access_token : result.token,
          user: {
            id: result.id,
            name: result.name,
            email: result.email,
          }
        }
      });
  } catch (err) {
    next(err);
  }
};

const selectUserInfo = async (req, res, next) => {
  try {
    let data = await User.selectUserInfo (req.query.userid);
    let authorID = data.author;
    let vistorID = req.user.id;
    //看有沒有聊過天
    if (authorID !== vistorID) {
      let authorRooms = await ChatModel.selectRoomCount(authorID);
      let vistorRooms = await ChatModel.selectRoomCount(vistorID);
      let authorRoomsArr = [];
      for (let k in authorRooms) {
        authorRoomsArr.push(authorRooms[k].room_id);
      };
      let vistorRoomsArr = [];
      for (let i in vistorRooms) {
        vistorRoomsArr.push(vistorRooms[i].room_id);
      };
      console.log(authorRoomsArr);
      console.log(vistorRoomsArr);
      let shareRoomID = "no";
      for (let j in authorRoomsArr) {
        if (vistorRoomsArr.indexOf(authorRoomsArr[j])!== -1) {
          shareRoomID = authorRoomsArr[j];
        }
      }
      data.shareRoomID = shareRoomID;
    }
    data.vistor = req.user.id;
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};


module.exports = {
  signUp,
  signIn,
  selectUserInfo
};