const Progress = require("../model/progress_model.js");
const Diary = require("../model/diary_model.js");
const User = require("../model/user_model.js");
const ChatModel = require("../model/chat_model.js");
require("dotenv").config();
const validator = require("validator");

const addProgress = async (req, res, next) => {
  try {
    // insert progress table
    let progressData;
    const reqData = JSON.parse(JSON.stringify(req.body));
    const validateResult = await progressValidator(res, reqData);
    if (validateResult == "validated") {
      if (req.file) {
        if (reqData.checkPrivacy) {
          progressData = {
            user_id: req.user.id,
            name: reqData.progressName,
            motivation: reqData.motivation,
            category: reqData.category,
            public: reqData.checkPrivacy,
            picture: req.file.originalname
          };
        } else {
          progressData = {
            user_id: req.user.id,
            name: reqData.progressName,
            motivation: reqData.motivation,
            category: reqData.category,
            public: "0",
            picture: req.file.originalname
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
      const insertProgressId = await Progress.addProgress(progressData);
      // insert progress_data table
      const progressDataArray = [];
      for (let i = 1; i < 4; i++) {
        if (reqData[`input${i}Name`] == "") {
          break;
        }
        const inputData = {
          progress_id: insertProgressId,
          name: reqData[`input${i}Name`],
          unit: reqData[`input${i}Unit`]
        };
        progressDataArray.push(inputData);
      }
      if (progressDataArray.length !== 0) {
        await Progress.addProgressData(progressDataArray);
      }
      res.sendStatus(200);
    }
  } catch (err) {
    next(err);
  }
};

const editProgress = async (req, res, next) => {
  try {
    let editProgressData;
    const reqData = JSON.parse(JSON.stringify(req.body));
    const validateResult = await progressValidator(res, reqData);
    if (validateResult == "validated") {
      const { src } = reqData;
      const splitArray = src.split("/");
      const index = splitArray.length - 1;
      const encodefilename = splitArray[index];
      // 以為是中文檔名
      const filename = decodeURIComponent(encodefilename);
      if (!req.file) {
      // 沒改照片或是remove本來的照片
        const progressData = await Progress.selectProgress(req.query);
        // 沒改照片
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
            picture: req.file.originalname
          };
        } else {
          editProgressData = {
            progressId: req.query.progressid,
            name: reqData.progressName,
            motivation: reqData.motivation,
            category: reqData.category,
            public: "0",
            picture: req.file.originalname
          };
        }
      }
      await Progress.editProgress(editProgressData);

      // update progress_data table
      const progressDataArray = [];
      for (let i = 1; i < 4; i++) {
        if (reqData[`input${i}Name`] == "") {
          break;
        }
        const inputData = {
          progress_id: req.query.progressid,
          name: reqData[`input${i}Name`],
          unit: reqData[`input${i}Unit`]
        };
        progressDataArray.push(inputData);
      }
      const progressData = {
        progress_id: req.query.progressid,
        data: progressDataArray
      };
      if (progressDataArray.length !== 0) {
        await Progress.editProgressData(progressData);
      }
      // 如果刪掉progress數據，日記相關數據也要刪掉
      const ProgressInfo = await Progress.selectProgress(req.query);
      const ProgressDataNameArray = [];
      for (const k in ProgressInfo.progressData) {
        ProgressDataNameArray.push(ProgressInfo.progressData[k].name);
      }
      const DiaryIdOfProgressArray = await Progress.selectDiaryId(req.query.progressid);
      for (const i in DiaryIdOfProgressArray) {
        const diaryInfo = await Diary.selectDiary(DiaryIdOfProgressArray[i]);
        const diaryId = DiaryIdOfProgressArray[i];
        const diaryDataNameArray = [];
        for (const j in diaryInfo.inputData) {
          diaryDataNameArray.push(diaryInfo.inputData[j].name);
        }
        for (const m in diaryDataNameArray) {
          const index = ProgressDataNameArray.indexOf(diaryDataNameArray[m]);
          if (index == -1) {
            const data = {
              diaryId: diaryId,
              name: diaryDataNameArray[m]
            };
            await Diary.deleteDiaryDataNotInProgress(data);
          }
        }
      }
      res.sendStatus(200);
    };
  } catch (err) {
    next(err);
  }
};

const selectProgress = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { progressid: '1' }
    let data;
    if (req.query.progressid) {
      const progressInfo = await Progress.selectProgress(req.query);
      const pictureName = progressInfo.progress.picture;
      const pictureWithPath = `${process.env.IMAGE_PATH}${pictureName}`;
      progressInfo.progress.picture = pictureWithPath;
      data = {
        data: progressInfo
      };
    }
    if (req.query.category) {
      data = await Progress.selectProgressCategory(req.query);
    }
    if (req.query.keyword) {
      data = await Progress.selectProgressSearch(req.query);
      const user = await User.selectUser(req.query);
      data.users = user;
    }
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const selectProgressTime = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { progressid: '1' }
    const data = await Diary.selectDiaryTime(req.query.progressid);
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const selectProgressChart = async (req, res, next) => {
  try {
    // req.body = { year: '2019', month: '10', datatype: 'mood' };
    // req.query parameter 傳回 { progressid: '1' };
    let data;
    const { year, month, datatype } = req.body;
    const { progressid } = req.query;
    const page = (req.query.paging) * 8;
    const sql = {
      year,
      month,
      datatype,
      progressid
    };
    const progressInfo = await Progress.selectProgress(req.query);
    if (progressInfo.progress.public == "1") {
      if (req.user.identity == "author") {
        if (datatype == "心情") {
          data = await Diary.selectDiaryMood(sql);
          // X,Y object
        } else {
          data = await Diary.selectDiaryChart(sql);
        }
        // 拿diary
        const diarySql = {
          year,
          month,
          progressid,
          page
        };
        // 加入日記資料
        const diarydata = await Diary.selectDiaryPage(diarySql);
        data.diarys = diarydata.diarys;
        if (req.query.paging == 0 && diarydata.allResultsLength > 8) {
          data.next_paging = 1;
        } else if (req.query.paging < diarydata.allPages - 1) {
          data.next_paging = parseInt(req.query.paging) + 1;
        }
      } else { data = {}; };
    } else if (progressInfo.progress.public == "0") {
      if (datatype == "心情") {
        data = await Diary.selectDiaryMood(sql);
        // X,Y object
      } else {
        data = await Diary.selectDiaryChart(sql);
      }
      // 拿diary
      const diarySql = {
        year,
        month,
        progressid,
        page
      };
      // 加入日記資料
      const diarydata = await Diary.selectDiaryPage(diarySql);
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
    const data = await Progress.selectProgressAuthor(req.query.progressid);
    const authorID = data.author;
    const vistorID = req.user.id;
    // 看有沒有聊過天
    if (authorID !== vistorID) {
      const authorRooms = await ChatModel.selectRoomCount(authorID);
      const vistorRooms = await ChatModel.selectRoomCount(vistorID);
      const authorRoomsArr = [];
      for (const k in authorRooms) {
        authorRoomsArr.push(authorRooms[k].room_id);
      };
      const vistorRoomsArr = [];
      for (const i in vistorRooms) {
        vistorRoomsArr.push(vistorRooms[i].room_id);
      };
      let shareRoomID = "no";
      for (const j in authorRoomsArr) {
        if (vistorRoomsArr.indexOf(authorRoomsArr[j]) !== -1) {
          shareRoomID = authorRoomsArr[j];
        }
      }
      data.shareRoomID = shareRoomID;
    }
    data.vistor = req.user.id;
    // 看此progress完成了沒
    const result = await Progress.selectProgress(req.query);
    data.status = result.progress.status;
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const addGroupProgress = async (req, res, next) => {
  try {
    const invivationCode = randomWord();
    const reqData = JSON.parse(JSON.stringify(req.body));
    const validateResult = await groupProgressValidator(res, reqData);
    if (validateResult == "validated") {
      // insert groupProgress table
      const creatorID = req.user.id;
      const progressData = {
        name: reqData.progressName,
        motivation: reqData.motivation,
        category: reqData.category,
        start_date: reqData.startDate,
        end_date: reqData.endDate,
        goal_verb: reqData.goalVerb,
        goal_num: reqData.goalNumber,
        goal_unit: reqData.goalUnit,
        invitation_code: invivationCode
      };
      if (req.file) {
        progressData.picture = req.file.originalname;
      } else {
        progressData.picture = "goalDefault.png";
      }
      const insertGroupProgressId = await Progress.addGroupProgress(progressData);
      // 插入groupProrgess_user table
      await Progress.isnertGroupProgressUser(creatorID, insertGroupProgressId);
      // 創群組聊天室
      let groupRoomData;
      if (req.file) {
        groupRoomData = {
          name: reqData.progressName,
          image: req.file.originalname,
          category: "group"
        };
      } else {
        groupRoomData = {
          name: reqData.progressName,
          image: "goalDefault.png",
          category: "group"
        };
      }
      // 創群組聊天室
      const insertRoomID = await ChatModel.createGroupRoom(groupRoomData);
      // 把創辨人加進去聊天室
      await ChatModel.addGroupChatMember(creatorID, insertRoomID);
      // 把group Progress 插入room_id
      await Progress.insertGroupRoomID(insertRoomID, insertGroupProgressId);
      const data = {
        insertGroupProgressId
      };
      res.status(200).send(data);
    }
  } catch (err) {
    next(err);
  }
};

const selectGroupProgress = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const groupProgressID = req.query.id;
    const groupProgressBasicInfo = await Progress.selectGroupProgressBasicInfo(userID, groupProgressID);
    res.status(200).send(groupProgressBasicInfo);
  } catch (err) {
    next(err);
  }
};

const addGroupPersonalProgress = async (req, res, next) => {
  try {
    const groupProgressBasicInfo = await Progress.addGroupPersonalProgress(req.body);
    res.status(200).send(groupProgressBasicInfo);
  } catch (err) {
    next(err);
  }
};

const editGroupProgress = async (req, res, next) => {
  try {
    const reqData = JSON.parse(JSON.stringify(req.body));
    const validateResult = await groupProgressValidator(res, reqData);
    if (validateResult == "validated") {
      const { src } = reqData;
      const splitArray = src.split("/");
      const index = splitArray.length - 1;
      const encodefilename = splitArray[index];
      // 如果是中文檔名
      const filename = decodeURIComponent(encodefilename);
      const progressData = {
        ID: req.query.id,
        name: reqData.progressName,
        motivation: reqData.motivation,
        category: reqData.category,
        startDate: reqData.startDate,
        endDate: reqData.endDate,
        goalVerb: reqData.goalVerb,
        goalNum: reqData.goalNumber,
        goalUnit: reqData.goalUnit
      };
      if (!req.file) {
        // 沒改照片或是remove本來的照片
        const groupProgressData = await Progress.selectGroupProgressBasicInfo(req.user.id, req.query.id);
        const originPicSrc = groupProgressData.basicInfo.picture;
        const originPicSrcSplitArr = originPicSrc.split("/");
        const index2 = originPicSrcSplitArr.length - 1;
        const originPicName = originPicSrcSplitArr[index2];
        if (filename == originPicName) {
          progressData.picture = filename;
        } else {
          // remove照片
          progressData.picture = "goalDefault.png";
        }
      } else {
        progressData.picture = req.file.originalname;
      }
      await Progress.editGroupProgress(progressData);
      return res.sendStatus(200);
    }
  } catch (err) {
    next(err);
  }
};

const selectGroupRoomInfo = async (req, res, next) => {
  try {
    const selectGroupRoomInfo = await ChatModel.selectGroupRoomInfo(req.query.id);
    res.status(200).send(selectGroupRoomInfo);
  } catch (err) {
    next(err);
  }
};

const joinGroupProgress = async (req, res, next) => {
  try {
    // 先依照邀請碼找出房間
    const groupProgressIDRoomID = await Progress.selectGroupProgressIDRoomID(req.body.invitationCode);
    if (!groupProgressIDRoomID) {
      res.sendStatus(403);
      return;
    }
    // 把user加入該groupProgress
    await Progress.isnertGroupProgressUser(req.user.id, groupProgressIDRoomID.id);
    // 把user加進去聊天室
    await ChatModel.addGroupChatMember(req.user.id, groupProgressIDRoomID.room_id);
    const data = {
      groupProgressID: groupProgressIDRoomID.id
    };
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const selectMyProgress = async (req, res, next) => {
  try {
    const vistorID = req.user.id;
    const authorID = req.query.userid;
    let authorProgress;
    if (vistorID == authorID) {
      authorProgress = await Progress.selectMyProgress("author", req.query.userid);
    } else {
      authorProgress = await Progress.selectMyProgress("vistor", req.query.userid);
    }
    res.status(200).send(authorProgress);
  } catch (err) {
    next(err);
  }
};

const selectNewProgress = async (req, res, next) => {
  try {
    const data = await Progress.selectNewProgress();
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const finishProgress = async (req, res, next) => {
  try {
    await Progress.finishProgress(req.query);
    res.sendStatus(200);
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
  selectProgressAuthor,
  addGroupProgress,
  selectGroupProgress,
  addGroupPersonalProgress,
  selectGroupRoomInfo,
  editGroupProgress,
  joinGroupProgress,
  selectMyProgress,
  selectNewProgress,
  finishProgress
};

// 產生邀請碼
function randomWord () {
  let str = "";
  const arr = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
    "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  for (let i = 0; i < 8; i++) {
    const pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

function groupProgressValidator (res, reqData) {
  return new Promise((resolve) => {
    if (!validator.isDate(reqData.startDate)) {
      res.status(400).send({ error: "日期格式錯誤" });
      return;
    }
    if (!reqData.progressName || !reqData.motivation || !reqData.startDate || !reqData.goalVerb || !reqData.goalNumber || !reqData.goalUnit) {
      res.status(400).send({ error: "未完整填入訊息" });
      return;
    }
    if (reqData.category !== "類別" && reqData.category !== "運動" && reqData.category !== "成長" && reqData.category !== "體態外表" && reqData.category !== "園藝" && reqData.category !== "學習" && reqData.category !== "居家" && reqData.category !== "烹飪" && reqData.category !== "作品") {
      res.status(400).send({ error: "沒有這個選項" });
      return;
    }

    if (reqData.progressName.length > 9 || reqData.motivation.length > 30 || reqData.goalVerb.length > 5 || reqData.goalUnit > 3) {
      res.status(400).send({ error: "輸入過長字元" });
      return;
    }
    if (reqData.endDate && !validator.isDate(reqData.endDate)) {
      res.status(400).send({ error: "日期格式錯誤" });
      return;
    }
    if (reqData.endDate !== "") {
      const newStartDate = new Date(reqData.startDate);
      const newEndDate = new Date(reqData.endDate);
      if (newStartDate > newEndDate) {
        res.status(400).send({ error: "結束日期不得早於開始日期" });
        return;
      }
    }
    const result = "validated";
    resolve(result);
  });
}

function progressValidator (res, reqData) {
  return new Promise((resolve) => {
    if (!reqData.progressName || !reqData.motivation || validator.isEmpty(reqData.motivation) || validator.isEmpty(reqData.progressName)) {
      res.status(400).send({ error: "Progress名字和動機為必填欄位" });
      return;
    }
    if (!validator.isIn(reqData.category, ["類別", "運動", "成長", "體態外表", "園藝", "學習", "居家", "烹飪", "作品"])) {
      res.status(400).send({ error: "沒有這種類別" });
      return;
    }

    if (reqData.checkPrivacy && reqData.checkPrivacy !== "1") {
      res.status(400).send({ error: "不正常" });
      return;
    }

    if (reqData.progressName.length > 9 || reqData.motivation.length > 30) {
      res.status(400).send({ error: "輸入過長字元" });
      return;
    }
    const result = "validated";
    resolve(result);
  });
}
