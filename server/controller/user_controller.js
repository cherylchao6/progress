const User = require("../model/user_model.js");
const ChatModel = require("../model/chat_model.js");
require("dotenv").config();
const validator = require("validator");

const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || validator.isEmpty(name) || validator.isEmpty(email) || validator.isEmpty(password)) {
      res.status(400).send({ error: "請輸入完整資訊" });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).send({ error: "請輸入正確的email格式" });
      return;
    }

    const result = await User.signUp(name, email, password);
    if (result.msg) {
      res.sendStatus(403);
      return;
    }

    res.status(200).send({
      data: {
        access_token: result.token,
        user: {
          id: result.id,
          name: result.name,
          email: result.email
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
    if (!email || !password || validator.isEmpty(password) || validator.isEmpty(email)) {
      res.status(400).send({ error: "請輸入完整資訊" });
      return;
    }
    const result = await User.signIn(email, password);
    // 帳號或密碼錯誤
    if (result.error == "user is not registered") {
      res.sendStatus(401);
      return;
    } else if (result.error == "password is wrong") {
      res.sendStatus(403);
      return;
    }
    res.status(200).send({
      data: {
        access_token: result.token,
        user: {
          id: result.id,
          name: result.name,
          email: result.email
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

const selectUserInfo = async (req, res, next) => {
  try {
    const data = await User.selectUserInfo(req.query.userid);
    const authorID = data.author;
    const vistorID = req.user.id;
    // 看有沒有聊過天
    if (authorID !== vistorID) {
      const authorRooms = await ChatModel.selectRoomCount(authorID);
      const vistorRooms = await ChatModel.selectRoomCount(vistorID);
      const authorRoomsArr = [];
      for (const k in authorRooms) {
        authorRoomsArr.push(authorRooms[k].room_id);
      };
      const vistorRoomsArr = [];
      for (const i in vistorRooms) {
        vistorRoomsArr.push(vistorRooms[i].room_id);
      };
      let shareRoomID = "no";
      for (const j in authorRoomsArr) {
        if (vistorRoomsArr.indexOf(authorRoomsArr[j]) !== -1) {
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

const updateUserProfile = async (req, res, next) => {
  try {
    let userData;
    const reqData = JSON.parse(JSON.stringify(req.body));
    if (req.file) {
      userData = {
        id: req.user.id,
        motto: reqData.updatemotto,
        photo: req.file.originalname
      };
    } else {
      userData = {
        id: req.user.id,
        motto: reqData.updatemotto,
        photo: "default-person.png"
      };
    }
    await User.updateUserProfile(userData);
    userData.photo = `${process.env.IMAGE_PATH}${userData.photo}`;
    res.status(200).send(userData);
  } catch (err) {
    next(err);
  }
};

const follow = async (req, res, next) => {
  try {
    const data = await User.follow(req.body);
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signUp,
  signIn,
  selectUserInfo,
  updateUserProfile,
  follow
};
