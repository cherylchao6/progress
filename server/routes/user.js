const express = require('express');
const router = express.Router();
const path = require('path');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
const {signUp, signIn, selectUserInfo, updateUserProfile} = require("../controller/user_controller");
const { verifyToken, upload} = require('../utils/util');


//signup
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'signup.html'));
});
router.post('/signup',signUp);
//signin
router.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'signin.html'));
});
router.post('/signin',signIn);
router.post('/updateUserProfile',verifyToken, upload.single("picture"), updateUserProfile);
router.get("/api/1.0/user", verifyToken, selectUserInfo);






module.exports = router;