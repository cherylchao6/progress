const Diary = require('../model/diary_model.js');
const addDiary = async (req, res, next) => {
  try {
    //insert diary table
    let diaryData;
    let reqData = JSON.parse(JSON.stringify(req.body));
    let reqImages = JSON.parse(JSON.stringify(req.files));
    if (reqImages["main_image"]) {
      diaryData = {
        progress_id: req.query['progressId'],
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
        main_image: reqImages["main_image"][0]["filename"]
      };
    } else {
      diaryData = {
        progress_id: req.query['progressId'],
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
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
    if (diaryDataArray !== 0) {
      await Diary.addDiaryData(diaryDataArray);
    }

  } catch (err) {
    next(err);
  }
};

const selectDiary = async (req, res, next) => {
  try {
    let {diaryid} = req.query;
    let diaryData = await Diary.selectDiary(diaryid);
    res.status(200).send({
      data : diaryData
    });
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
    //images轉碼
    let reqImageSrcArray = reqData.imagesSrc.split(',');
    let reqImagesArray = [];
    for( var i in reqImageSrcArray ){
      let splitArray = reqImageSrcArray[i].split('/');
      let index = splitArray.length - 1;
      let encodefilename = splitArray[index];
      let filename = decodeURIComponent(encodefilename);
      reqImagesArray.push(filename);
    }
    //整理回傳的照片檔名矩陣，拿掉3ubuq5o(未上傳圖片時的檔名)
    for (let j in reqImagesArray) {
      if ( reqImagesArray[i] == '3ubuq5o') { 
        reqImagesArray.splice(i, 1); 
          i--; 
      } 
    }
    console.log(reqData);
    //update diary table
    if (!reqImages["main_image"]) {
      //src mainImage轉碼
      let splitArray = reqData.mainImageSrc.split('/');
      let index = splitArray.length - 1;
      let encodefilename = splitArray[index];
      let mainImageName = decodeURIComponent(encodefilename);
      //case1取消照片
      if (reqData.mainImageName == '3ubuq5o') {
        editDiaryData = {
            diary_id: req.query.diaryid,
            date: reqData.date,
            mood: reqData.mood,
            content: reqData.content,
            main_image: "default.jpeg"
          };
      } else {
        editDiaryData = {
            diary_id: req.query.diaryid,
            date: reqData.date,
            mood: reqData.mood,
            content: reqData.content,
            main_image: mainImageName
        };
      } 
    } else if (reqImages["main_image"]) {
      editDiaryData = {
        diary_id: req.query.diaryid,
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
        main_image: reqImages["main_image"][0]["filename"]
      };
    }
    await Diary.editDiary(editDiaryData);
    
    //insert diaryImages table
    //全部刪除重插
    if (reqImages["images"]) {
      let upLoadImageArray = []
      for (let i in reqImages["images"]) {
        upLoadImageArray.push(reqImages["images"][i]['filename']);
      }
      let diaryData = await Diary.selectDiary(req.query.diaryid);
      let diaryImageArray = []; 
      for (let k in diaryData['images']) {
        diaryImageArray.push(diaryData['images'][k]['fileName']);
      }
      for (let j in upLoadImageArray) {
        let index = diaryImageArray.indexOf(upLoadImageArray[j])
        if (index == -1) {
          diaryImageArray.push(upLoadImageArray[j]);
        }
      }
      let sqlArray = [];
      for (let l in diaryImageArray) {
        let imageArray = [];
        imageArray.push(req.query.diaryid);
        imageArray.push(diaryImageArray[l]);
        sqlArray.push(imageArray);
      };
      await Diary.deleteDiaryImages(req.query.diaryid);
      await Diary.addDiaryImages(sqlArray);
    }
    //Update diaryData table
    let diaryDataArray = [];
    for (let i = 1; i < 4; i++ ) {
      if (reqData[`input${i}`] == '') {
        break;
      }
      let inputData = {
        diary_id: req.query.diaryid,
        input_set: i,
        name: reqData[`input${i}Name`],
        value: reqData[`input${i}`],
        unit: reqData[`input${i}Unit`]
      };
      diaryDataArray.push(inputData);
    }
    await Diary.editDiaryData(diaryDataArray);


    //   let insertDiaryDataResult = await Diary.addDiaryData(diaryDataArray);
  } catch (err) {
    next(err);
  }
};




module.exports = {
  addDiary,
  selectDiary,
  editDiary,
};