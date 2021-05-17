const express = require('express');
const router = express.Router();
const path = require('path');
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
const { verifyToken, verifyAdminToken, upload} = require('../utils/util');
const {addProgress, editProgress, selectProgress} = require("../controller/progress_controller");

//addProgress
router.get('/addProgress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'addProgress.html'));
});

router.post('/addProgress',verifyToken, upload.single("picture"), addProgress);

router.get('/editProgress', (req, res) => {
  res.sendFile(path.join(__dirname + '../../../public/' + 'editProgress.html'));
});

router.post("/editprogress", verifyToken, upload.single("picture"), editProgress);
router.get("/api/1.0/progress", verifyAdminToken, selectProgress);
module.exports = router;
