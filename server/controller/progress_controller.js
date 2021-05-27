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

    //如果刪掉progress數據，日記相關數據也要刪掉
    let ProgressInfo = await Progress.selectProgress(req.query);
    let ProgressDataNameArray = [];
    for (let k in ProgressInfo.progressData) {
      ProgressDataNameArray.push(ProgressInfo.progressData[k].name);
    }
    let DiaryIdOfProgressArray = await Progress.selectDiaryId(req.query.progressid);
    for (let i in DiaryIdOfProgressArray) {
      let diaryInfo = await Diary.selectDiary(DiaryIdOfProgressArray[i]);
      let diaryId = DiaryIdOfProgressArray[i];
      let diaryDataNameArray = [];
      for (let j in diaryInfo.inputData ) {
        diaryDataNameArray.push(diaryInfo.inputData[j].name);
      }
      for (let m in diaryDataNameArray) {
        let index = ProgressDataNameArray.indexOf(diaryDataNameArray[m]);
        if (index == -1) { 
          let data = {
            diaryId: diaryId,
            name: diaryDataNameArray[m]
          };
          await Diary.deleteDiaryDataNotInProgress(data);
        }
      }
    }
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

const selectProgressTime = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { progressid: '1' }
    let data = await Diary.selectDiaryTime(req.query.progressid);
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const selectProgressChart = async (req, res, next) => {
  try {
    //req.body = { year: '2019', month: '10', datatype: 'mood' };
    // req.query parameter 傳回 { progressid: '1' };
    let data;
    let {year, month, datatype} = req.body
    let {progressid} = req.query
    let page = (req.query.paging) * 8;
    let sql = {
      year,
      month,
      datatype,
      progressid
    }
    let progressInfo = await Progress.selectProgress(req.query);
    if (progressInfo.progress.public == "1") {
      if (req.user.identity == "author") {
        if (datatype == "心情") {
          data = await Diary.selectDiaryMood(sql)
          //X,Y object
        } else {
          data = await Diary.selectDiaryChart(sql);
        }
        //拿diary
        let diarySql = {
          year,
          month,
          progressid,
          page
        }
        //加入日記資料
        let diarydata = await Diary.selectDiaryPage(diarySql);
        data.diarys = diarydata.diarys;
        if (req.query.paging == 0 && diarydata.allResultsLength > 8) {
          data.next_paging = 1;
        } else if (req.query.paging < diarydata.allPages - 1) {
          data.next_paging = parseInt(req.query.paging) + 1;
        }
      } else {data={}};
    } else if (progressInfo.progress.public == "0") {
      if (datatype == "心情") {
        data = await Diary.selectDiaryMood(sql)
        //X,Y object
      } else {
        data = await Diary.selectDiaryChart(sql);
      }
      //拿diary
      let diarySql = {
        year,
        month,
        progressid,
        page
      }
      //加入日記資料
      let diarydata = await Diary.selectDiaryPage(diarySql);
      data.diarys = diarydata.diarys;
      if (req.query.paging == 0 && diarydata.allResultsLength > 8) {
        data.next_paging = 1;
      } else if (req.query.paging < diarydata.allPages - 1) {
        data.next_paging = parseInt(req.query.paging) + 1;
      }
    };
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const selectProgressWithDiarys = async (req, res, next) => {
  try {
    let data;
    // req.query parameter 傳回 { progressid: '1' };
    if (req.user.identity == "author") {
      data = await Progress.selectProgressWithDiarys(req.query.progressid);
    } else if (req.user.identity == "vistor") {
      data = await Progress.selectProgressWithDiarysVistor(req.query.progressid);
    }
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const selectProgressAuthor = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { progressid: '1' };
    let data = await Progress.selectProgressAuthor(req.query.progressid);
    data.vistor = req.user.id
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};



module.exports = {
  addProgress,
  editProgress,
  selectProgress,
  selectProgressTime,
  selectProgressChart,
  selectProgressWithDiarys,
  selectProgressAuthor
};