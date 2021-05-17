const express = require('express');
const router = express.Router();
const path = require('path');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
const {signUp, signIn} = require("../controller/user_controller");


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






module.exports = router;