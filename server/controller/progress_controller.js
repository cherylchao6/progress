const Progress = require('../model/progress_model.js');
require('dotenv').config();

const addProgress = async (req, res, next) => {
  try {
    let progressData;
    let reqData = JSON.parse(JSON.stringify(req.body));
    if (req.file) {
      if (reqData.checkPrivacy) {
        progressData = {
          user_id: req.user.id,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          public: reqData.checkPrivacy,
          picture: req.file.filename
        };
      } else {
        progressData = {
          user_id: req.user.id,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          public: "0",
          picture: req.file.filename
        };
      }
    } else {
      if (reqData.checkPrivacy) {
        progressData = {
          user_id: req.user.id,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          public: reqData.checkPrivacy,
          picture: "default.jpeg"
        };
      } else {
        progressData = {
          user_id: req.user.id,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          public: "0",
          picture: "default.jpeg"
        };
      }
    }
    await Progress.addProgress(progressData); 
  } catch (err) {
    next(err);
  }
};

const editProgress = async (req, res, next) => {
  try {
    let editProgressData;
    let reqData = JSON.parse(JSON.stringify(req.body));
    let {src} = reqData;
    let splitArray = src.split('/');
    let index = splitArray.length - 1;
    let encodefilename = splitArray[index];
    //以為是中文檔名
    let filename = decodeURIComponent(encodefilename);
    if (!req.file) {
      //沒改照片或是remove本來的照片
      let progressData = await Progress.selectProgress(req.query);
      //沒改照片
      if (progressData.picture == filename) {
        editProgressData = {
          progressId: req.query.progressid,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          picture: progressData.picture
        };
        if (reqData.checkPrivacy) { 
          editProgressData.public = "1";
        } else if (!reqData.checkPrivacy) {
          editProgressData.public = "0";
        }
      } else if (src == "https://bit.ly/3ubuq5o") {
        editProgressData = {
          progressId: req.query.progressid,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          picture: "default.jpeg"
        };
        if (reqData.checkPrivacy) { 
          editProgressData.public = "1";
        } else if (!reqData.checkPrivacy) {
          editProgressData.public = "0";
        }
      }
    } else {
      if (reqData.checkPrivacy) {
        editProgressData = {
          progressId: req.query.progressid,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          public: reqData.checkPrivacy,
          picture: req.file.filename
        };
      } else {
        editProgressData = {
          progressId: req.query.progressid,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          public: "0",
          picture: req.file.filename
        };
      }
    }
    await Progress.editProgress(editProgressData);
  } catch (err) {
    next(err);
  }
};

const selectProgress = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { progressid: '1' }
    let progressData = await Progress.selectProgress(req.query);
    let pictureName = progressData.picture;
    let pictureWithPath = `${process.env.IMAGE_PATH}${pictureName}`;
    progressData.picture = pictureWithPath;
    let data = {
      data: progressData
    }
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};





module.exports = {
  addProgress,
  editProgress,
  selectProgress
};