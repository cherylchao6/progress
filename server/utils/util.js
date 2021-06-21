const jwt = require("jsonwebtoken");
const { pool } = require("../model/mysql");
const validator = require("validator");

function verifyToken (req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token === "null") {
    return res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
      // token result
      // {
      //   id: 1,
      //   name: '趙姿涵',
      //   email: 'nmpyt21@gmail.com',
      //   iat: 1624089748,
      //   exp: 1624176148
      // }
      req.user = result;
      next();
    });
  }
}

function verifyAuthor (req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      };
      req.user = result;
      const progressId = req.query.progressid;
      const userId = result.id;
      const sql = `SELECT * FROM progress WHERE id = ${progressId} AND user_id = ${userId}`;
      const checkUser = await pool.query(sql);
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
  // if (authHeader) then do authHeader.split(' ')[1] -> token = undefined or is token
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      };
      const progressId = req.query.progressid;
      const userId = result.id;
      const sql = `SELECT * FROM progress WHERE id = ${progressId} AND user_id = ${userId}`;
      const checkUser = await pool.query(sql);
      if (checkUser[0].length == 0) {
        result.identity = "vistor";
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

function vefifyGroupMember (req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      };
      req.user = result;
      const groupProgressID = req.query.id;
      const userID = result.id;
      const sql = `SELECT * FROM group_progress_user WHERE group_progress_id = ${groupProgressID} AND user_id = ${userID}`;
      const checkUser = await pool.query(sql);
      if (checkUser[0].length == 0) {
        res.sendStatus(405);
      } else if (checkUser[0].length !== 0) {
        next();
      };
    });
  }
}

function verifyreqQuery (req, res, next) {
  const reqObject = req.query;
  const reqQueryArr = Object.values(reqObject);
  for (const i in reqQueryArr) {
    if (!validator.isInt(reqQueryArr[i])) {
      return res.sendStatus(401);
    }
  }
  next();
}

async function verifyRoomMember (req, res) {
  const sql = `SELECT user FROM room_user WHERE room_id = ${req.query.roomid}`;
  const checkMember = await pool.query(sql);
  for (const i in checkMember[0]) {
    if (parseInt(checkMember[0][i].user) == req.user.id) {
      return res.sendStatus(200);
    }
  }
  return res.sendStatus(403);
}

const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const multer = require("multer");
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "myprogress-club",
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, file.originalname);
    }
  }),
  limits: {
    // 限制上傳檔案的大小為 1MB
    fileSize: 1000000
  }
});

module.exports = {
  verifyToken,
  verifyAuthor,
  verifyVistor,
  vefifyGroupMember,
  verifyreqQuery,
  verifyRoomMember,
  upload
};
