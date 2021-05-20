const express = require('express');
const router = express.Router();
const path = require('path');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
const { verifyToken, verifyAuthor, verifyAdminToken, upload} = require('../utils/util');
const {addProgress, editProgress, selectProgress,selectProgressTime} = require("../controller/progress_controller");

//addProgress
router.get('/addProgress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'addProgress.html'));
});
router.get('/progress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'progress.html'));
});

router.post('/addProgress',verifyToken, upload.single("picture"), addProgress);

router.get('/editProgress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'editProgress.html'));
});

router.post("/editprogress", verifyAuthor, upload.single("picture"), editProgress);
router.get("/api/1.0/progress", verifyAdminToken, selectProgress);
router.get("/api/1.0/progressTime", verifyAdminToken, selectProgressTime);
module.exports = router;
