const express = require("express");
const router = express.Router();
const path = require("path");
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
const { verifyToken, verifyAuthor, verifyVistor, vefifyGroupMember, verifyreqQuery, verifyRoomMember, upload } = require("../utils/util");
const { addProgress, editProgress, selectProgress, selectProgressTime, selectProgressChart, selectProgressWithDiarys, selectProgressAuthor, addGroupProgress, selectGroupProgress, addGroupPersonalProgress, selectGroupRoomInfo, editGroupProgress, joinGroupProgress, selectMyProgress, selectNewProgress, finishProgress } = require("../controller/progress_controller");

// addProgress
router.get("/addProgress", (req, res) => {
  res.sendFile(path.join(__dirname + "../../../public/" + "addProgress.html"));
});
router.get("/progress", (req, res) => {
  res.sendFile(path.join(__dirname + "../../../public/" + "progress.html"));
});

router.get("/editProgress", (req, res) => {
  res.sendFile(path.join(__dirname + "../../../public/" + "editProgress.html"));
});

router.get("/myProgress", (req, res) => {
  res.sendFile(path.join(__dirname + "../../../public/" + "myProgress.html"));
});

router.get("/addGroupProgress", (req, res) => {
  res.sendFile(path.join(__dirname + "../../../public/" + "addGroupProgress.html"));
});

router.get("/groupProgress", (req, res) => {
  res.sendFile(path.join(__dirname + "../../../public/" + "groupProgress.html"));
});

router.get("/editGroupProgress", (req, res) => {
  res.sendFile(path.join(__dirname + "../../../public/" + "editGroupProgress.html"));
});

router.post("/addProgress", verifyToken, upload.single("picture"), addProgress);
router.post("/editprogress", verifyreqQuery, verifyAuthor, upload.single("picture"), editProgress);
router.get("/api/1.0/progress", verifyreqQuery, verifyToken, selectProgress);
router.get("/api/1.0/progress/diarys", verifyreqQuery, verifyVistor, selectProgressWithDiarys);
router.get("/api/1.0/progressTime", verifyreqQuery, verifyToken, selectProgressTime);
router.get("/api/1.0/author", verifyreqQuery, verifyToken, selectProgressAuthor);
router.post("/progressChart", verifyVistor, selectProgressChart);
router.get("/api/1.0/groupProgress", verifyreqQuery, vefifyGroupMember, selectGroupProgress);
router.post("/groupProgress/personalData", verifyreqQuery, vefifyGroupMember, addGroupPersonalProgress);
router.get("/api/1.0/selectGroupChat", selectGroupRoomInfo);
router.post("/addGroupProgress", verifyToken, upload.single("picture"), addGroupProgress);
router.post("/editGroupProgress", verifyreqQuery, vefifyGroupMember, upload.single("picture"), editGroupProgress);
router.post("/checkInvitation", verifyToken, joinGroupProgress);
router.get("/api/1.0/myprogress", verifyreqQuery, verifyToken, selectMyProgress);
router.get("/api/1.0/topProgresses", verifyToken, selectNewProgress);
router.post("/finishProgress", verifyreqQuery, verifyAuthor, finishProgress);
router.post("/api/1.0/roomMember", verifyreqQuery, verifyToken, verifyRoomMember);
router.get("/api/1.0/progressSearch", verifyToken, selectProgress);
module.exports = router;
