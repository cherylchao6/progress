require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { pool } = require("./mysql");

// 從controller傳來的值
const signUp = async (name, email, password) => {
  const checkEmail = await pool.query("SELECT email FROM users WHERE email = ?", [email]);
  if (checkEmail[0].length > 0) {
    const msg = "email already exists";
    return { msg };
  }
  const user = {
    name,
    email
  };
  user.password = encryptPassword(password);
  const signUpResult = await pool.query("INSERT INTO users SET ?", user);
  // 挑出insert完的id,insertId 為Mysql內建auto increment id
  user.id = signUpResult[0].insertId;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "86400s" });
  user.token = token;
  // 改變上線狀態
  await pool.query(`UPDATE users SET online='1' WHERE id=${signUpResult[0].insertId}`);
  // 同時插入未讀訊息通知表
  await pool.query(`INSERT INTO new_msg_status (user_id) VALUES (${signUpResult[0].insertId})`);
  return user;
};

const signIn = async (email, password) => {
  const queryStr = "SELECT id, name, email, password FROM users WHERE email = ?";
  const checkUser = await pool.query(queryStr, email);
  const user = checkUser[0][0];
  const inputPassword = encryptPassword(password);
  if (checkUser[0].length == 0) {
    return { error: "user is not registered" };
  } else if (inputPassword != user.password) {
    return { error: "password is wrong" };
  } else {
    user.token = jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "86400s" });
    // 改變為上線狀態
    await pool.query(`UPDATE users SET online='1' WHERE id=${checkUser[0][0].id}`);
    return user;
  }
};

const selectUserPic = async (userID) => {
  const result = await pool.query(`SELECT photo FROM users WHERE id =${userID}`);
  const userPic = result[0][0].photo;
  return userPic;
};

const selectUserInfo = async (userID) => {
  const userBasicInfo = await pool.query(`SELECT id, name, photo, motto FROM users WHERE id=${userID}`);
  const finishedProgress = await pool.query(`SELECT id FROM progress WHERE user_id=${userID} AND status =1`);
  const unfinishedProgress = await pool.query(`SELECT id FROM progress WHERE user_id=${userID} AND status =0`);
  const follower = await pool.query(`SELECT follow.follower_id, users.name, users.photo FROM follow JOIN users ON users.id = follow.follower_id WHERE following_id = ${userID}`);
  for (const i in follower[0]) {
    follower[0][i].photo = `${process.env.IMAGE_PATH}${follower[0][i].photo}`;
  }
  const following = await pool.query(`SELECT follow.following_id, users.name, users.photo FROM follow JOIN users ON users.id = follow.following_id WHERE follower_id = ${userID}`);
  for (const i in following[0]) {
    following[0][i].photo = `${process.env.IMAGE_PATH}${following[0][i].photo}`;
  }
  const data = {
    author: userBasicInfo[0][0].id,
    name: userBasicInfo[0][0].name,
    photo: `${process.env.IMAGE_PATH}${userBasicInfo[0][0].photo}`,
    motto: userBasicInfo[0][0].motto,
    finishedProgress: finishedProgress[0].length,
    unfinishedProgress: unfinishedProgress[0].length,
    follower: follower[0],
    following: following[0]
  };
  return data;
};

const logOut = async (userID) => {
  await pool.query(`UPDATE users SET online="0" where id =${userID}`);
};

const updateUserProfile = async (userData) => {
  const { id, motto, photo } = userData;
  await pool.query(`UPDATE users SET motto="${motto}", photo='${photo}' WHERE id=${id}`);
};

const selectUser = async (requestInfo) => {
  const namekeyword = requestInfo.keyword;
  const sqlValue = [`%${namekeyword}%`];
  const result = await pool.query("SELECT * FROM users WHERE name LIKE ?", sqlValue);
  for (const i in result[0]) {
    result[0][i].photo = `${process.env.IMAGE_PATH}${result[0][i].photo}`;
  }
  return result[0];
};

const follow = async (request) => {
  // 先選避免重複追蹤
  const { fans, idol } = request;
  const sqlValue1 = [fans, idol];
  const result = await pool.query("SELECT * FROM follow WHERE follower_id = ? AND following_id = ?", sqlValue1);
  if (result[0].length == 0) {
    await pool.query("INSERT INTO follow (follower_id, following_id) VALUES ?", [[sqlValue1]]);
    const data = {
      followStatus: "追蹤成功"
    };
    return data;
  } else if (result[0].length !== 0) {
    await pool.query("DELETE FROM follow WHERE follower_id = ? AND following_id = ?", sqlValue1);
    const data = {
      followStatus: "取消追蹤成功"
    };
    return data;
  }
};

function encryptPassword (password) {
  const hash = crypto.createHash("sha1");
  hash.update(password);
  return hash.digest("hex");
}

module.exports = {
  signUp,
  signIn,
  selectUserPic,
  selectUserInfo,
  logOut,
  updateUserProfile,
  follow,
  selectUser
};
