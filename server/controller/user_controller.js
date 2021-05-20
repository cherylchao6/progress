const User = require('../model/user_model.js');


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


module.exports = {
  signUp,
  signIn
};