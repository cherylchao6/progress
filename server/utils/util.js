const jwt = require('jsonwebtoken');
const { pool } = require('../model/mysql');
const validator = require('validator');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization; 
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token);
  if (token === "null") {
    console.log("no token");
    return res.sendStatus(401);
  } else {
    console.log(process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
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
        console.log(err);
        return res.sendStatus(403);
      };
      req.user = result;
      console.log("..................")
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
      if (checkUser[0].length == 0) {
        res.sendStatus(405);
      } else if (checkUser[0].length !== 0) {
        next();
      };
    });
  }
}

function verifyreqQuery (req, res, next) {
  console.log("verifyreqQuery.................")
  let reqObject = req.query;
  console.log(reqObject);
  let reqQueryArr = Object.values(reqObject);
  console.log(reqQueryArr);

  for (let i in reqQueryArr) {
    if (!validator.isInt(reqQueryArr[i])) {
      console.log("not a number");
      return res.sendStatus(401);
    } 
  } 
  next();
}


async function verifyRoomMember (req, res, next) {
  console.log("verifyRoomMember......")
  let sql = `SELECT user FROM room_user WHERE room_id = ${req.query.roomid}`;
  let checkMember = await pool.query(sql);
  for (let i in checkMember[0]) {
    if (parseInt(checkMember[0][i].user) == req.user.id) {
      return res.sendStatus(200);
    }
  }
  return res.sendStatus(403);
}


const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const multer = require('multer');
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'myprogress-club',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, file.originalname);
    }
  }),
  limits: {
    // 限制上傳檔案的大小為 1MB
    fileSize: 1000000
  }
})

// //Multer for uploading files
// const storage = multer.diskStorage({
//   destination: 'public/uploaded/',
//   filename: function (req, file, cb) {
//       cb(null, file.originalname);},
// });

// const upload = multer({ 
//   storage: storage,
//   limits: {
//     // 限制上傳檔案的大小為 1MB
//     fileSize: 1000000
//   }
// });



module.exports = {
  verifyToken,
  verifyAdminToken,
  verifyAuthor,
  verifyVistor,
  vefifyGroupMember,
  verifyreqQuery,
  verifyRoomMember,
  upload
}