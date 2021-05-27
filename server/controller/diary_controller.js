const Diary = require('../model/diary_model.js');
const Progress = require('../model/progress_model.js');

const addDiary = async (req, res, next) => {
  try {
    //insert diary table
    let diaryData;
    let reqData = JSON.parse(JSON.stringify(req.body));
    let reqImages = JSON.parse(JSON.stringify(req.files));
    let dateArray = reqData.date.split("-");
    if (reqImages["main_image"]) {
      diaryData = {
        progress_id: req.query['progressId'],
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
        year: dateArray[0],
        month: dateArray[1],
        day: dateArray[2],
        main_image: reqImages["main_image"][0]["filename"]
      };
    } else {
      diaryData = {
        progress_id: req.query['progressId'],
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
        year: dateArray[0],
        month: dateArray[1],
        day: dateArray[2],
        main_image: "default.jpeg"
      };
    };
    let insertDiaryId= await Diary.addDiary(diaryData); 
    //insert diaryImages table

    if (reqImages["images"]) {
      let sqlArray = []
      for (let i in reqImages["images"]) {
        let imageArray = [];
        imageArray.push(insertDiaryId);
        imageArray.push(reqImages["images"][i]['filename']);
        sqlArray.push(imageArray);
      };
      await Diary.addDiaryImages(sqlArray);
    }
    //insert diaryData table
    let diaryDataArray = [];
    for (let i = 1; i < 4; i++ ) {
      if (reqData[`input${i}`] == '') {
        break;
      }
      let inputData = {
        diary_id: insertDiaryId,
        name: reqData[`input${i}Name`],
        value: reqData[`input${i}`],
        unit: reqData[`input${i}Unit`]
      };
      diaryDataArray.push(inputData);
    }
    if (diaryDataArray.length !== 0) {
      await Diary.addDiaryData(diaryDataArray);
    }
  } catch (err) {
    next(err);
  }
};

const selectDiary = async (req, res, next) => {
  try {
    let {diaryid,progressid} = req.query;
    let progressData = await Progress.selectProgress(req.query);
    if (progressData.progress.public == "1") {
      if (req.user.identity == "author") {
        let diaryData = await Diary.selectDiary(diaryid);
        let progressInfo = await Progress.selectProgressBasicInfo(progressid);
        res.status(200).send({
          data : diaryData,
          progressInfo
        });
      } else {res.status(200).send({});}
    } else if (progressData.progress.public == "0") {
        let diaryData = await Diary.selectDiary(diaryid);
        let progressInfo = await Progress.selectProgressBasicInfo(progressid);
        res.status(200).send({
          data : diaryData,
          progressInfo
        });
      }
  } catch (err) {
    next(err);
  }
};

const editDiary = async (req, res, next) => {
  try {
    //Update diary table
    let editDiaryData;
    let reqData = JSON.parse(JSON.stringify(req.body));
    let reqImages = JSON.parse(JSON.stringify(req.files));
    let dateArray = reqData.date.split("-");
    //images轉碼
    let reqImageSrcArray = reqData.imagesSrc.split(',');
    let reqImagesArray = [];
    let reqImagesWithoutNewFileArray = [];
    for( let i in reqImageSrcArray ) {
      let splitArray = reqImageSrcArray[i].split('/');
      if (splitArray[0] !== "blob:http:") {
          reqImagesWithoutNewFileArray.push(reqImageSrcArray[i]);
        };
    }
    for (let k in reqImagesWithoutNewFileArray) {
      let splitArray = reqImagesWithoutNewFileArray[k].split('/');
      let index = splitArray.length - 1;
      let encodefilename = splitArray[index];
      let filename = decodeURIComponent(encodefilename);
      reqImagesArray.push(filename);
    }
    //整理回傳的照片檔名矩陣，拿掉3ubuq5o(未上傳圖片時的檔名)
    for (let j=0; j < reqImagesArray.length; j++) {
      if ( reqImagesArray[j] == '3ubuq5o') { 
        reqImagesArray.splice(j, 1);
        j--
      } 
    }
    //update diary table
    if (!reqImages["main_image"]) {
      //src mainImage轉碼
      let splitArray = reqData.mainImageSrc.split('/');
      let index = splitArray.length - 1;
      let encodefilename = splitArray[index];
      let mainImageName = decodeURIComponent(encodefilename);
      //case1取消照片
      if (mainImageName == '3ubuq5o') {
        editDiaryData = {
            diary_id: req.query.diaryid,
            date: reqData.date,
            mood: reqData.mood,
            content: reqData.content,
            year: dateArray[0],
            month: dateArray[1],
            day: dateArray[2],
            main_image: "default.jpeg"
          };
      } else {
        editDiaryData = {
            diary_id: req.query.diaryid,
            date: reqData.date,
            mood: reqData.mood,
            content: reqData.content,
            year: dateArray[0],
            month: dateArray[1],
            day: dateArray[2],
            main_image: mainImageName
        };
      } 
    } else if (reqImages["main_image"]) {
      editDiaryData = {
        diary_id: req.query.diaryid,
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
        year: dateArray[0],
        month: dateArray[1],
        day: dateArray[2],
        main_image: reqImages["main_image"][0]["filename"]
      };
    }
    await Diary.editDiary(editDiaryData);
    //insert diaryImages table
    //全部刪除重插
    if (reqImages["images"]) {
      for (let i in reqImages["images"]) {
        reqImagesArray.push(reqImages["images"][i]['filename']);
      }
      let sqlArray = [];
      for (let l in reqImagesArray) {
        let imageArray = [];
        imageArray.push(req.query.diaryid);
        imageArray.push(reqImagesArray[l]);
        sqlArray.push(imageArray);
      };
      await Diary.deleteDiaryImages(req.query.diaryid);
      await Diary.addDiaryImages(sqlArray);
    } else if (!reqImages["images"]) {
      let sqlArray = [];
      //若reqImagesArray.length == 0 表示使用者一開始日記就沒有上傳照片而且也沒有新增照片
      if (reqImagesArray.length !== 0) {
        for (let l in reqImagesArray) {
          let imageArray = [];
          imageArray.push(req.query.diaryid);
          imageArray.push(reqImagesArray[l]);
          sqlArray.push(imageArray);
        };
        await Diary.deleteDiaryImages(req.query.diaryid);
        await Diary.addDiaryImages(sqlArray);
      } 
    }
    //Update diaryData table
    let diaryDataArray = [];
    for (let i = 1; i < 4; i++ ) {
      if (reqData[`input${i}`] == '') {
        break;
      }
      let inputData = {
        diary_id: req.query.diaryid,
        name: reqData[`input${i}Name`],
        value: reqData[`input${i}`],
        unit: reqData[`input${i}Unit`]
      };
      diaryDataArray.push(inputData);
    }
    await Diary.editDiaryData(diaryDataArray);

  } catch (err) {
    next(err);
  }
};




module.exports = {
  addDiary,
  selectDiary,
  editDiary,
};