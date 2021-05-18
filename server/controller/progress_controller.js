const Progress = require('../model/progress_model.js');
const Diary = require('../model/diary_model.js');
require('dotenv').config();

const addProgress = async (req, res, next) => {
  try {
    //insert progress table
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
    let insertProgressId = await Progress.addProgress(progressData); 
    //insert progress_data table
    let progressDataArray = [];
    for (let i = 1; i < 4; i++ ) {
      if (reqData[`input${i}Name`] == '') {
        break;
      }
      let inputData = {
        progress_id: insertProgressId,
        name: reqData[`input${i}Name`],
        unit: reqData[`input${i}Unit`]
      };
      progressDataArray.push(inputData);
    }
    if (progressDataArray.length !== 0) {
      await Progress.addProgressData(progressDataArray);
    } 
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
      if (progressData.progress.picture == filename) {
        editProgressData = {
          progressId: req.query.progressid,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          picture: progressData.progress.picture
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

    //update progress_data table
    let progressDataArray = [];
    for (let i = 1; i < 4; i++ ) {
      if (reqData[`input${i}Name`] == '') {
        break;
      }
      let inputData = {
        progress_id: req.query.progressid,
        name: reqData[`input${i}Name`],
        unit: reqData[`input${i}Unit`]
      };
      progressDataArray.push(inputData);
    }
    let progressData = {
      progress_id: req.query.progressid,
      data: progressDataArray
    }
    await Progress.editProgressData(progressData);

    // //如果刪掉progress數據，日記相關數據也要刪掉
    // let ProgressInfo = await Progress.selectProgress(req.query);
    // console.log(ProgressInfo);
    // let ProgressDataNameArray = [];
    // for (let k in ProgressInfo.progressData) {
    //   ProgressDataNameArray.push(ProgressInfo.progressData[k].name);
    // }
    // console.log(ProgressDataNameArray);
    // let DiaryIdOfProgressArray = await Progress.selectDiaryId(req.query.progressid);
    // console.log(DiaryIdOfProgressArray);
    // for (let i in DiaryIdOfProgressArray) {
    //   let diaryInfo = await Diary.selectDiary(DiaryIdOfProgressArray[i]);
    //   console.log(diaryInfo);
    //   let diaryDataNameArray = [];
    //   for (let j in diaryInfo.inputData ) {
    //     diaryDataNameArray.push(diaryInfo.inputData[j].name);
    //   }
    //   console.log(diaryDataNameArray);
    //   for (let m in diaryDataNameArray) {
    //     if (diaryDataNameArray[m] ) {

    //     }
    //   }
    // }
  } catch (err) {
    next(err);
  }
};

const selectProgress = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { progressid: '1' }
    let progressInfo = await Progress.selectProgress(req.query);
    let pictureName = progressInfo.progress.picture;
    let pictureWithPath = `${process.env.IMAGE_PATH}${pictureName}`;
    progressInfo.progress.picture = pictureWithPath;
    let data = {
      data: progressInfo
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