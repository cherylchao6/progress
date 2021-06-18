const Diary = require("../model/diary_model.js");
const Progress = require("../model/progress_model.js");
const validator = require("validator");
require("dotenv").config();
const addDiary = async (req, res, next) => {
  try {
    // insert diary table
    let diaryData;
    const reqData = JSON.parse(JSON.stringify(req.body));
    const reqImages = JSON.parse(JSON.stringify(req.files));
    const dateArray = reqData.date.split("-");
    if (!validator.isDate(reqData.date)) {
      res.status(400).send({ error: "日期格式錯誤" });
      return;
    }
    if (!validator.isIn(reqData.mood, ["0", "1", "2", "3", "4", "5", "6", "7"])) {
      res.status(400).send({ error: "沒有這種心情" });
      return;
    }
    if (reqImages.main_image) {
      diaryData = {
        progress_id: req.query.progressid,
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
        year: dateArray[0],
        month: dateArray[1],
        day: dateArray[2],
        main_image: reqImages.main_image[0].originalname
      };
    } else {
      diaryData = {
        progress_id: req.query.progressid,
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
        year: dateArray[0],
        month: dateArray[1],
        day: dateArray[2],
        main_image: "default.jpeg"
      };
    };
    const insertDiaryId = await Diary.addDiary(diaryData);
    // insert diaryImages table
    if (reqImages.images) {
      const sqlArray = [];
      for (const i in reqImages.images) {
        const imageArray = [];
        imageArray.push(insertDiaryId);
        imageArray.push(reqImages.images[i].originalname);
        sqlArray.push(imageArray);
      };
      await Diary.addDiaryImages(sqlArray);
    }
    // insert diaryData table
    const diaryDataArray = [];
    for (let i = 1; i < 4; i++) {
      if (reqData[`input${i}`] == "") {
        break;
      }
      const inputData = {
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
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const selectDiary = async (req, res, next) => {
  try {
    const { diaryid, progressid } = req.query;
    const progressData = await Progress.selectProgress(req.query);
    if (progressData.progress.public == "1") {
      if (req.user.identity == "author") {
        const diaryData = await Diary.selectDiary(diaryid);
        const progressInfo = await Progress.selectProgressBasicInfo(progressid);
        res.status(200).send({
          data: diaryData,
          progressInfo
        });
        return;
      } else { res.status(200).send({}); return; }
    } else if (progressData.progress.public == "0") {
      const diaryData = await Diary.selectDiary(diaryid);
      const progressInfo = await Progress.selectProgressBasicInfo(progressid);
      res.status(200).send({
        data: diaryData,
        progressInfo
      });
      return;
    }
  } catch (err) {
    next(err);
  }
};

const editDiary = async (req, res, next) => {
  try {
    // Update diary table
    let editDiaryData;
    const reqData = JSON.parse(JSON.stringify(req.body));
    const reqImages = JSON.parse(JSON.stringify(req.files));
    console.log("113");
    console.log(reqImages);
    const dateArray = reqData.date.split("-");
    if (!validator.isDate(reqData.date)) {
      res.status(400).send({ error: "日期格式錯誤" });
      return;
    }
    if (!validator.isIn(reqData.mood, ["0", "1", "2", "3", "4", "5", "6", "7"])) {
      res.status(400).send({ error: "沒有這種心情" });
      return;
    }
    // images轉碼
    const reqImageSrcArray = reqData.imagesSrc.split(",");
    const reqImagesArray = [];
    const reqImagesWithoutNewFileArray = [];
    console.log("127");
    console.log(reqImageSrcArray);
    for (const i in reqImageSrcArray) {
      console.log("130");
      console.log(reqImageSrcArray[i]);
      const splitArray = reqImageSrcArray[i].split("/");
      console.log("133");
      console.log(splitArray);
      const uploadSrc = process.env.UPLOADSRC;
      console.log("136");
      console.log(uploadSrc);
      if (splitArray[0] !== uploadSrc) {
        console.log("137");
        reqImagesWithoutNewFileArray.push(reqImageSrcArray[i]);
      };
    }
    console.log("139");
    console.log(reqImagesWithoutNewFileArray);
    for (const k in reqImagesWithoutNewFileArray) {
      console.log("142");
      console.log(reqImagesWithoutNewFileArray[k]);
      const splitArray = reqImagesWithoutNewFileArray[k].split("/");
      console.log("145");
      console.log(splitArray);
      const index = splitArray.length - 1;
      const encodefilename = splitArray[index];
      console.log("149");
      console.log(encodefilename);
      const filename = decodeURIComponent(encodefilename);
      console.log("152");
      console.log(filename);
      reqImagesArray.push(filename);
    }
    console.log("156");
    console.log(reqImagesArray);
    // 整理回傳的照片檔名矩陣，拿掉3ubuq5o(未上傳圖片時的檔名)
    for (let j = 0; j < reqImagesArray.length; j++) {
      if (reqImagesArray[j] == "3ubuq5o") {
        reqImagesArray.splice(j, 1);
        j--;
      }
    }
    console.log("165");
    console.log(reqImagesArray);
    // update diary table
    if (!reqImages.main_image) {
      // src mainImage轉碼
      const splitArray = reqData.mainImageSrc.split("/");
      const index = splitArray.length - 1;
      const encodefilename = splitArray[index];
      const mainImageName = decodeURIComponent(encodefilename);
      // case1取消照片
      if (mainImageName == "3ubuq5o") {
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
    } else if (reqImages.main_image) {
      editDiaryData = {
        diary_id: req.query.diaryid,
        date: reqData.date,
        mood: reqData.mood,
        content: reqData.content,
        year: dateArray[0],
        month: dateArray[1],
        day: dateArray[2],
        main_image: reqImages.main_image[0].originalname
      };
    }
    await Diary.editDiary(editDiaryData);
    // insert diaryImages table
    // 全部刪除重插
    if (reqImages.images) {
      for (const i in reqImages.images) {
        console.log(reqImages.images[i].originalname);
        reqImagesArray.push(reqImages.images[i].originalname);
      }
      const sqlArray = [];
      for (const l in reqImagesArray) {
        const imageArray = [];
        imageArray.push(req.query.diaryid);
        imageArray.push(reqImagesArray[l]);
        sqlArray.push(imageArray);
        console.log(imageArray);
      };
      await Diary.deleteDiaryImages(req.query.diaryid);
      await Diary.addDiaryImages(sqlArray);
    } else if (!reqImages.images) {
      const sqlArray = [];
      if (reqImagesArray.length !== 0) {
        // 使用者一開始日記有上傳照片然後沒有在新增新的
        for (const l in reqImagesArray) {
          const imageArray = [];
          imageArray.push(req.query.diaryid);
          imageArray.push(reqImagesArray[l]);
          sqlArray.push(imageArray);
        };
        await Diary.deleteDiaryImages(req.query.diaryid);
        await Diary.addDiaryImages(sqlArray);
      } else if (reqImagesArray.length == 0) {
        // 使用者一開始有上傳照片但全部移掉
        await Diary.deleteDiaryImages(req.query.diaryid);
      }
    }
    // Update diaryData table
    const diaryDataArray = [];
    for (let i = 1; i < 4; i++) {
      if (reqData[`input${i}`] == "") {
        break;
      }
      const inputData = {
        diary_id: req.query.diaryid,
        name: reqData[`input${i}Name`],
        value: reqData[`input${i}`],
        unit: reqData[`input${i}Unit`]
      };
      diaryDataArray.push(inputData);
    }
    await Diary.editDiaryData(diaryDataArray);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addDiary,
  selectDiary,
  editDiary
};
