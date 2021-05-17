const jwt = require('jsonwebtoken');
const multer = require('multer');
const { query } = require('../model/mysql');
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
  upload
}