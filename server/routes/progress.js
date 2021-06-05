const express = require('express');
const router = express.Router();
const path = require('path');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
const { verifyToken, verifyAuthor, verifyAdminToken, verifyVistor, vefifyGroupMember, upload} = require('../utils/util');
const {addProgress, editProgress, selectProgress,selectProgressTime,selectProgressChart,selectProgressWithDiarys,selectProgressAuthor, addGroupProgress, selectGroupProgress, addGroupPersonalProgress,selectGroupRoomInfo, editGroupProgress, joinGroupProgress,selectMyProgress,selectNewProgress} = require("../controller/progress_controller");

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

router.get('/myProgress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'myProgress.html'));
});

router.get('/addGroupProgress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'addGroupProgress.html'));
});

router.get('/groupProgress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'groupProgress.html'));
});

router.get('/editGroupProgress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'editGroupProgress.html'));
});

router.post('/addGroupProgress',verifyToken, upload.single("picture"), addGroupProgress);

router.post("/editprogress", verifyAuthor, upload.single("picture"), editProgress);
router.get("/api/1.0/progress", verifyToken, selectProgress);
router.get("/api/1.0/progress/diarys", verifyVistor, selectProgressWithDiarys);
router.get("/api/1.0/progressTime", verifyToken, selectProgressTime);
router.get("/api/1.0/author", verifyToken, selectProgressAuthor);
router.post("/progressChart", verifyVistor,selectProgressChart);
router.get("/api/1.0/groupProgress", vefifyGroupMember, selectGroupProgress);
router.post("/groupProgress/personalData", vefifyGroupMember, addGroupPersonalProgress);
router.get('/api/1.0/selectGroupChat',selectGroupRoomInfo);
router.post('/editGroupProgress',vefifyGroupMember, upload.single("picture"), editGroupProgress);
router.post("/checkInvitation", verifyToken, joinGroupProgress);
router.get("/api/1.0/myprogress", verifyToken, selectMyProgress);
router.get("/api/1.0/topProgresses", verifyToken, selectNewProgress);
module.exports = router;


