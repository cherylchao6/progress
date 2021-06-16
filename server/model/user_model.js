require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('./mysql');

//從controller傳來的值
const signUp = async (name, email, password) => {
  try { 
    let checkEmail = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
    if (checkEmail[0].length > 0) {
      let msg = 'email already exists';
        return {msg};
    }
    let user = {
      name,
      email
    };   
    user.password = encryptPassword(password);
    let signUpResult = await pool.query('INSERT INTO users SET ?', user);
    //挑出insert完的id,insertId 為Mysql內建auto increment id 
    user.id = signUpResult[0].insertId;
    let token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '86400s' });
    user.token = token;
    //改變上線狀態
    await pool.query(`UPDATE users SET online='1' WHERE id=${signUpResult[0].insertId}`);
    //同時插入未讀訊息通知表
    await pool.query(`INSERT INTO new_msg_status (user_id) VALUES (${signUpResult[0].insertId})`);
    return user;
  } catch (error) {
    throw error;
  }
};
const signIn = async (email, password) => {
  try {   
      let queryStr = 'SELECT id, name, email, password FROM users WHERE email = ?';
      let checkUser = await pool.query(queryStr, email);
      let user = checkUser[0][0];
      let inputPassword = encryptPassword(password);
      if (checkUser[0].length == 0) {
          return {error: 'user is not registered'};
      } else if (inputPassword != user.password){
          return {error: 'password is wrong'};
      } else {
          user.token = jwt.sign({
              id: user.id,
              name: user.name,
              email: user.email,
          }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '86400s' });
          //改變為上線狀態
          await pool.query(`UPDATE users SET online='1' WHERE id=${checkUser[0][0].id}`);
          return user;
      }
  } catch (error) {
      throw error;
  }
};

const selectUserPic = async (userID) => {
  try {   
    let result = await pool.query (`SELECT photo FROM users WHERE id =${userID}`);
    let userPic = result[0][0].photo;
    return userPic;
  } catch (error) {
    throw error;
  }
};

const selectUserInfo = async (userID) => {
  try {
    let userBasicInfo = await pool.query(`SELECT id, name, photo, motto FROM users WHERE id=${userID}`);
    let finishedProgress = await pool.query (`SELECT id FROM progress WHERE user_id=${userID} AND status =1`);
    let unfinishedProgress = await pool.query (`SELECT id FROM progress WHERE user_id=${userID} AND status =0`);
    let follower = await pool.query (`SELECT follow.follower_id, users.name, users.photo FROM follow JOIN users ON users.id = follow.follower_id WHERE following_id = ${userID}`);
    for (let i in follower[0]) {
      follower[0][i].photo = `${process.env.IMAGE_PATH}${follower[0][i].photo}`;
    }
    let following = await pool.query (`SELECT follow.following_id, users.name, users.photo FROM follow JOIN users ON users.id = follow.following_id WHERE follower_id = ${userID}`);
    for (let i in following[0]) {
      following[0][i].photo = `${process.env.IMAGE_PATH}${following[0][i].photo}`;
    }
    let data = {
      author: userBasicInfo[0][0].id,
      name: userBasicInfo[0][0].name,
      photo: `${process.env.IMAGE_PATH}${userBasicInfo[0][0].photo}`,
      motto: userBasicInfo[0][0].motto,
      finishedProgress: finishedProgress[0].length,
      unfinishedProgress: unfinishedProgress[0].length,
      follower: follower[0],
      following: following[0]
    }
    return data;
  } catch (error) {
    throw error;
  }
};

const logOut = async (userID) => {
  try {   
    let result = await pool.query (`UPDATE users SET online="0" where id =${userID}`);
  } catch (error) {
    throw error;
  }
};

const updateUserProfile = async (userData) => {
  try {  
    let {id, motto, photo} = userData;
    let result = await pool.query (`UPDATE users SET motto="${motto}", photo='${photo}' WHERE id=${id}`);
  } catch (error) {
    console.log(error)
    throw error;
  }
};

const selectUser = async (requestInfo) => {
  try {  
    let namekeyword = requestInfo.keyword;
    let sqlValue = [`%${namekeyword}%`];
    let result = await pool.query(`SELECT * FROM users WHERE name LIKE ?`, sqlValue);
    for (let i in result[0]) {
      result[0][i].photo = `${process.env.IMAGE_PATH}${result[0][i].photo}`
    }
    return result[0];
  } catch (error) {
    console.log(error)
    throw error;
  }
};

const follow = async (request) => {
  try {  
    //先選避免重複追蹤
    let {fans, idol} = request;
    let sqlValue1 = [fans, idol];
    let result = await pool.query (`SELECT * FROM follow WHERE follower_id = ? AND following_id = ?`,sqlValue1);
    if (result[0].length == 0) {
      await pool.query(`INSERT INTO follow (follower_id, following_id) VALUES ?`, [[sqlValue1]]);
      let data = {
        followStatus: "追蹤成功"
      }
      return data;
    } else if (result[0].length !== 0) {
      await pool.query(`DELETE FROM follow WHERE follower_id = ? AND following_id = ?`, sqlValue1);
      let data = {
        followStatus: "取消追蹤成功"
      }
      return data;
    }
  } catch (error) {
    console.log(error)
    throw error;
  }
};

function encryptPassword(password) {
  const hash = crypto.createHash('sha1');
  hash.update(password);
  return hash.digest('hex');
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