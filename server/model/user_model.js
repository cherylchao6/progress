require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('./mysql');

//從controller傳來的值
const signUp = async (name, email, password) => {
  try { 
    let checkEmail = await query('SELECT email FROM users WHERE email = ?', [email]);
    if (checkEmail.length > 0) {
      let msg = 'email already exists';
        return {msg};
    }
    let user = {
      name,
      email
    };   
    user.password = encryptPassword(password);
    let signUpResult = await query('INSERT INTO users SET ?', user);
    //挑出insert完的id,insertId 為Mysql內建auto increment id 
    user.id = signUpResult.insertId;
    let token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '86400s' });
    user.token = token;
    return user;
  } catch (error) {
    console.log(error);
    return {error};
  }
};
const signIn = async (email, password) => {
  try {   
      let queryStr = 'SELECT id, name, email, password FROM users WHERE email = ?';
      let checkUser = await query(queryStr, email);
      let user = checkUser[0]
      let inputPassword = encryptPassword(password);
      if (checkUser.length == 0) {
        console.log("here");
          return {error: 'user is not registered'};
      } else if (inputPassword != user.password){
          return {error: 'password is wrong'}
      } else {
          user.token = jwt.sign({
              id: user.id,
              name: user.name,
              email: user.email,
          }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '86400s' })
          return user;
      }
  } catch (error) {
      return {error}
  }
}


function encryptPassword(password) {
  const hash = crypto.createHash('sha1');
  hash.update(password);
  return hash.digest('hex');
}

module.exports = {
  signUp,
  signIn
};