const express = require('express');
const router = express.Router();
const path = require('path');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
const { verifyToken, verifyAuthor, verifyAdminToken, verifyVistor, verifyreqQuery, upload } = require('../utils/util');
const {addDiary, editDiary, selectDiary} = require("../controller/diary_controller");

//addDiary
router.get('/addDiary', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'addDiary.html'));
});
let fields = [{ name: 'main_image', maxCount: 1 }, { name: 'images', maxCount: 8 }];
router.post('/addDiary', verifyreqQuery, verifyAuthor, upload.fields(fields), addDiary);
//edirDiary
router.get('/editDiary', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'editDiary.html'));
});
router.post('/editDiary', verifyreqQuery, verifyAuthor, upload.fields(fields), editDiary);
router.get('/api/1.0/diary', verifyreqQuery, verifyVistor, selectDiary);
//diary頁面
router.get('/diary', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'diary.html'));
});




module.exports = router;