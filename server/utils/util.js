const jwt = require('jsonwebtoken');
const multer = require('multer');
const { pool } = require('../model/mysql');
// authorization: Bearer <access_token>
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization; 
  //if (authHeader) then do authHeader.split(' ')[1] -> token = undefined or is token
  const token = authHeader && authHeader.split(' ')[1];
  if (token === "null") {
    res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) return res.sendStatus(403);
      console.log(result);
      req.user = result;
      next();
    });
  }
}

function verifyAuthor (req, res, next) {
  const authHeader = req.headers.authorization; 
  //if (authHeader) then do authHeader.split(' ')[1] -> token = undefined or is token
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
      if (err) {
        console.log(err)
        return res.sendStatus(403)
      };
      req.user = result;
      let progressId = req.query.progressid;
      let userId = result.id;
      let sql = `SELECT * FROM progress WHERE id = ${progressId} AND user_id = ${userId}`;
      let checkUser = await pool.query(sql);
      console.log(checkUser);
      if (checkUser[0].length == 0) {
        res.sendStatus(405);
      } else if (checkUser[0].length == 1) {
        next();
      };
    });
  }
}

function verifyVistor (req, res, next) {
  const authHeader = req.headers.authorization; 
  //if (authHeader) then do authHeader.split(' ')[1] -> token = undefined or is token
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
      if (err) {
        console.log(err)
        return res.sendStatus(403);
      };
      let progressId = req.query.progressid;
      let userId = result.id;
      let sql = `SELECT * FROM progress WHERE id = ${progressId} AND user_id = ${userId}`;
      let checkUser = await pool.query(sql);
      if (checkUser[0].length == 0) {
        result.identity = 'vistor';
        req.user = result;
        next();
      } else if (checkUser[0].length == 1) {
        result.identity = "author";
        req.user = result;
        next();
      }
    });
  }
}

function verifyAdminToken (req, res, next) {
  const authHeader = req.headers.authorization; 
  //if (authHeader) then do authHeader.split(' ')[1] -> token = undefined or is token
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
      if (err) {
        console.log(err)
        return res.sendStatus(403)
      };
      let email = result.email;
      let sql = 'SELECT role FROM users WHERE email = ?';
      let checkAdmin = await query(sql, email);
      if (checkAdmin[0].role !== 1) {
        res.sendStatus(403);
      } else if (checkAdmin[0].role === 1) {
        next();
      };
    });
  }
}

function vefifyGroupMember (req, res, next) {
  const authHeader = req.headers.authorization; 
  //if (authHeader) then do authHeader.split(' ')[1] -> token = undefined or is token
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log("no token");
    res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      };
      req.user = result;
      let groupProgressID = req.query.id;
      let userID = result.id;
      let sql = `SELECT * FROM group_progress_user WHERE group_progress_id = ${groupProgressID} AND user_id = ${userID}`;
      let checkUser = await pool.query(sql);
      console.log(checkUser);
      if (checkUser[0].length == 0) {
        res.sendStatus(405);
      } else if (checkUser[0].length !== 0) {
        next();
      };
    });
  }
}



//Multer for uploading files
const storage = multer.diskStorage({
  destination: 'public/uploaded/',
  filename: function (req, file, cb) {
      cb(null, file.originalname);},
});
const upload = multer({ storage: storage });


module.exports = {
  verifyToken,
  verifyAdminToken,
  verifyAuthor,
  verifyVistor,
  vefifyGroupMember,
  upload
}