const Progress = require('../model/progress_model.js');
const Diary = require('../model/diary_model.js');
const ChatModel = require('../model/chat_model.js');
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
    let authorID = data.author;
    let vistorID = req.user.id;
    //看有沒有聊過天
    if (authorID !== vistorID) {
      let authorRooms = await ChatModel.selectRoomCount(authorID);
      let vistorRooms = await ChatModel.selectRoomCount(vistorID);
      let authorRoomsArr = [];
      for (let k in authorRooms) {
        authorRoomsArr.push(authorRooms[k].room_id);
      };
      let vistorRoomsArr = [];
      for (let i in vistorRooms) {
        vistorRoomsArr.push(vistorRooms[i].room_id);
      };
      console.log(authorRoomsArr);
      console.log(vistorRoomsArr);
      let shareRoomID = "no"
      for (let j in authorRoomsArr) {
        if (vistorRoomsArr.indexOf(authorRoomsArr[j])!== -1) {
          shareRoomID = authorRoomsArr[j];
        }
      }
      data.shareRoomID = shareRoomID;
    }
    data.vistor = req.user.id
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const addGroupProgress = async (req, res, next) => {
  try {
    let invivationCode = randomWord()
    //insert groupProgress table
    let progressData;
    let reqData = JSON.parse(JSON.stringify(req.body));
    console.log("addGroupProgress Controller");
    console.log(reqData);
    console.log(req.file);
    let creatorID = req.user.id
    if (req.file) {
      progressData = {
        name: reqData.progressName,
        motivation: reqData.motivation,
        category: reqData.category,
        start_date: reqData.startDate,
        end_date: reqData.endDate,
        goal_verb: reqData.goalVerb,
        goal_num: reqData.goalNumber,
        goal_unit: reqData.goalUnit,
        picture: req.file.filename,
        invitation_code: invivationCode
      }
    } else {
      progressData = {
        name: reqData.progressName,
        motivation: reqData.motivation,
        category: reqData.category,
        start_date: reqData.startDate,
        end_date: reqData.endDate,
        goal_verb: reqData.goalVerb,
        goal_num: reqData.goalNumber,
        goal_unit: reqData.goalUnit,
        picture: "goalDefault.png",
        invitation_code: invivationCode
      }
    }
    let insertGroupProgressId = await Progress.addGroupProgress(progressData);
    console.log(insertGroupProgressId);
    //插入groupProrgess_user table
    await Progress.isnertGroupProgressUser(creatorID, insertGroupProgressId);
    //創群組聊天室
    let groupRoomData;
    if (req.file) {
      groupRoomData = {
        name: reqData.progressName,
        image: req.file.filename,
        category: "group"
      }
    } else {
      groupRoomData = {
        name: reqData.progressName,
        image: "goalDefault.png",
        category: "group"
      }
    }
    //創群組聊天室
    let insertRoomID = await ChatModel.createGroupRoom(groupRoomData);
    //把創辨人加進去聊天室
    await ChatModel.addGroupChatMember(creatorID, insertRoomID);
    //把group Progress 插入room_id
    await Progress.insertGroupRoomID(insertRoomID, insertGroupProgressId)
    let data = {
      insertGroupProgressId
    }
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const selectGroupProgress = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { id: '1' };
    console.log("selectGroupProgress controller")
    let userID = req.user.id
    let groupProgressID = req.query.id;
    let groupProgressBasicInfo = await Progress.selectGroupProgressBasicInfo(userID, groupProgressID)
    console.log(groupProgressBasicInfo);
    res.status(200).send(groupProgressBasicInfo);
  } catch (err) {
    next(err);
  }
};


const addGroupPersonalProgress = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { id: '1' };
    console.log("addGroupPersonalProgress controller..............")
    console.log(req.body);
    let groupProgressBasicInfo = await Progress.addGroupPersonalProgress(req.body);
    console.log(groupProgressBasicInfo);
    res.status(200).send(groupProgressBasicInfo);
  } catch (err) {
    next(err);
  }
};

const editGroupProgress = async (req, res, next) => {
  try {
    console.log("editGroupProgress controller........");
    let progressData;
    let reqData = JSON.parse(JSON.stringify(req.body));
    console.log(reqData);
    console.log(req.file);
    let {src} = reqData;
    let splitArray = src.split('/');
    let index = splitArray.length - 1;
    let encodefilename = splitArray[index];
    //如果是中文檔名
    let filename = decodeURIComponent(encodefilename);
    if (!req.file) {
      //沒改照片或是remove本來的照片
      let groupProgressData = await Progress.selectGroupProgressBasicInfo(req.user.id, req.query.id);
      let originPicSrc = groupProgressData.basicInfo.picture;
      let originPicSrcSplitArr = originPicSrc.split('/');
      let index2 = originPicSrcSplitArr.length - 1;
      let originPicName = originPicSrcSplitArr[index2];
      if (filename == originPicName) {
        console.log("same...........")
        progressData = {
          ID: req.query.id,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          startDate: reqData.startDate,
          endDate: reqData.endDate,
          goalVerb: reqData.goalVerb,
          goalNum: reqData.goalNumber,
          goalUnit: reqData.goalUnit,
          picture: filename
        }
      } else {
        //remove照片
        console.log("removePIC.......")
        progressData = {
          ID: req.query.id,
          name: reqData.progressName,
          motivation: reqData.motivation,
          category: reqData.category,
          startDate: reqData.startDate,
          endDate: reqData.endDate,
          goalVerb: reqData.goalVerb,
          goalNum: reqData.goalNumber,
          goalUnit: reqData.goalUnit,
          picture: "goalDefault.png"
        }
      }
    } else {
      console.log("change a new pic")
      progressData = {
        ID: req.query.id,
        name: reqData.progressName,
        motivation: reqData.motivation,
        category: reqData.category,
        startDate: reqData.startDate,
        endDate: reqData.endDate,
        goalVerb: reqData.goalVerb,
        goalNum: reqData.goalNumber,
        goalUnit: reqData.goalUnit,
        picture: req.file.filename
      }
    }
    await Progress.editGroupProgress(progressData);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const selectGroupRoomInfo = async (req, res, next) => {
  try {
    // req.query parameter 傳回 { id: '1' };
    console.log("selectGroupRoomInfo controller..............")
    console.log(req.query);
    let selectGroupRoomInfo = await ChatModel.selectGroupRoomInfo(req.query.id);
    console.log(selectGroupRoomInfo);
    res.status(200).send(selectGroupRoomInfo);
  } catch (err) {
    next(err);
  }
};

const joinGroupProgress = async (req, res, next) => {
  try {
    console.log(req.body);
    console.log("joinGroupProgress controller..............")
    //先依照邀請碼找出房間
    let groupProgressIDRoomID = await Progress.selectGroupProgressIDRoomID(req.body.invitationCode);
    console.log(groupProgressIDRoomID);
    if (!groupProgressIDRoomID) {
      res.sendStatus(403);
      return;
    }
    //把user加入該groupProgress
    await Progress.isnertGroupProgressUser(req.user.id, groupProgressIDRoomID.id);
    //把user加進去聊天室
    await ChatModel.addGroupChatMember(req.user.id, groupProgressIDRoomID.room_id);
    let data = {
      groupProgressID: groupProgressIDRoomID.id
    };
    res.status(200).send(data);
  } catch (err) {
    next(err);
  }
};

const selectMyProgress = async (req, res, next) => {
  try {
    console.log("selectMyProgress controller");
     let vistorID = req.user.id
     let authorID = req.query.userid
     console.log(vistorID)
     console.log(authorID )
     let authorProgress;
     if (vistorID == authorID) {
      console.log("hererere");
      authorProgress = await Progress.selectMyProgress('author',req.query.userid);
     } else {
      authorProgress = await Progress.selectMyProgress('vistor',req.query.userid);
     }
    res.status(200).send(authorProgress);
  } catch (err) {
    next(err);
  }
};

const selectNewProgress = async (req, res, next) => {
  try {
    console.log("selectNewProgress controller");
    let data = await Progress.selectNewProgress()
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
  selectProgressAuthor,
  addGroupProgress,
  selectGroupProgress,
  addGroupPersonalProgress,
  selectGroupRoomInfo,
  editGroupProgress,
  joinGroupProgress,
  selectMyProgress,
  selectNewProgress
};

//產生邀請碼
function randomWord() {
    let str = "",
    arr = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z','0', '1', '2', '3', '4', '5', '6', '7', '8', '9',];
    
    for (let i = 0; i < 8; i++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
    }
    return str;
  }