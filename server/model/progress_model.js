const { response } = require('express');
const { pool } = require ('./mysql');


const addProgress = async (addProgress) => {
  let result  = await pool.query('INSERT INTO progress SET ?', addProgress);
  let progressId = result[0].insertId;
  return progressId;
};

const addProgressData = async (progressDataArray) => {
  let sqlArray = [];
  for (let i in progressDataArray) {
    let inputArray = [];
    inputArray.push(progressDataArray[i]['progress_id']);
    inputArray.push(progressDataArray[i]['name']);
    inputArray.push(progressDataArray[i]['unit']);
    sqlArray.push(inputArray);
  }
  await pool.query('INSERT INTO progress_data (progress_id, name, unit) VALUES ?', [sqlArray]);
};

const selectProgress = async (progressId) => {
  let id = progressId.progressid;
  let progress = await pool.query(`SELECT * FROM progress WHERE id=${id}`);
  let progressData = await pool.query(`SELECT name, unit FROM progress_data WHERE progress_id=${id}`);
  let progressInfo = {
    progress: progress[0][0],
    progressData: progressData[0]
  };
  return progressInfo;
};

const selectProgressWithDiarys = async (progressId) => {
  let progress = await pool.query(`SELECT name, category, motivation, public, picture, status FROM progress WHERE id=${progressId}`);
  progress[0][0].picture = `${process.env.IMAGE_PATH}${progress[0][0].picture}`;
  let progressData = await pool.query(`SELECT name, unit FROM progress_data WHERE progress_id=${progressId}`);
  let diarys = await pool.query(`SELECT date, main_image FROM diary WHERE progress_id=${progressId} ORDER BY date`);
  for ( let i in diarys[0]) {
    diarys[0][i].main_image = `${process.env.IMAGE_PATH}${diarys[0][i].main_image}`;
  }
  let data = {
    name: progress[0][0].name,
    category: progress[0][0].category,
    motivation: progress[0][0].motivation,
    public: progress[0][0].public,
    status: progress[0][0].status,
    picture: progress[0][0].picture,
    datatype: progressData[0],
    diarys: diarys[0],
  };
  return data;
};

const selectProgressWithDiarysVistor = async (progressId) => {
  let progress = await pool.query(`SELECT name, category, motivation, public, picture, status FROM progress WHERE id=${progressId} and public = "0"`);
  if (progress[0].length !== 0) {
    progress[0][0].picture = `${process.env.IMAGE_PATH}${progress[0][0].picture}`
    let progressData = await pool.query(`SELECT name, unit FROM progress_data WHERE progress_id=${progressId}`);
    let diarys = await pool.query(`SELECT date, main_image FROM diary WHERE progress_id=${progressId} ORDER BY date`);
    for ( let i in diarys[0]) {
      diarys[0][i].main_image = `${process.env.IMAGE_PATH}${diarys[0][i].main_image}`
    }
    let data = {
      name: progress[0][0].name,
      category: progress[0][0].category,
      motivation: progress[0][0].motivation,
      public: progress[0][0].public,
      status: progress[0][0].status,
      picture: progress[0][0].picture,
      datatype: progressData[0],
      diarys: diarys[0],
    };
    return data;
  } else {
    let data = {};
  }
};

const selectDiaryId = async (progressId) => {
  let DiaryIdOfProgress = await pool.query(`SELECT id FROM diary WHERE progress_id=${progressId}`);
  let diaryIdArray = [];
  if (DiaryIdOfProgress[0].length !== 0) {
    for (let i in DiaryIdOfProgress[0]) {
      diaryIdArray.push(DiaryIdOfProgress[0][i].id);
    }
  }
  return (diaryIdArray);
};

const editProgress = async (editProgressData) => {
  let {progressId, name, motivation, category, picture, public} = editProgressData;
  let sqlValue = [`${name}`, `${motivation}`, `${category}`, `${picture}`, `${public}`];
  let result = await pool.query(`UPDATE progress SET name =?, motivation=?, category=?, picture=?, public=? WHERE id='${progressId}'`, sqlValue);
};

const editProgressData = async (progressData) => {
  let {progress_id} =  progressData;
  await pool.query(`DELETE FROM progress_data WHERE progress_id=${progress_id}`);
  let sqlArray = [];
  for (let i in progressData.data){
    let inputArray = [];
    inputArray.push(progressData.data[i]['progress_id']);
    inputArray.push(progressData.data[i]['name']);
    inputArray.push(progressData.data[i]['unit']);
    sqlArray.push(inputArray);
  }
  await pool.query('INSERT INTO progress_data (progress_id, name, unit) VALUES ?', [sqlArray]);
};

const selectProgressAuthor = async (progressid) => {
  let authorid = await pool.query (`SELECT user_id FROM progress WHERE id = ${progressid}`);
  let authorProfile = await pool.query (`SELECT id, name, photo, motto FROM users WHERE id=${authorid[0][0].user_id}`);
  let finishedProgress = await pool.query (`SELECT id FROM progress WHERE user_id=${authorid[0][0].user_id} AND status =1`);
  let follower = await pool.query (`SELECT follow.follower_id, users.name, users.photo FROM follow JOIN users ON users.id = follow.follower_id WHERE following_id = ${authorid[0][0].user_id}`);
  let following = await pool.query (`SELECT follow.following_id, users.name, users.photo FROM follow JOIN users ON users.id = follow.following_id WHERE follower_id = ${authorid[0][0].user_id}`);
  for (let i in follower[0]) {
    follower[0][i].photo = `${process.env.IMAGE_PATH}${follower[0][i].photo}`;
  }
  for (let i in following[0]) {
    following[0][i].photo = `${process.env.IMAGE_PATH}${following[0][i].photo}`;
  }
  let data = {
    author: authorProfile[0][0].id,
    name: authorProfile[0][0].name,
    photo: `${process.env.IMAGE_PATH}${authorProfile[0][0].photo}`,
    motto: authorProfile[0][0].motto,
    finishedProgress: finishedProgress[0].length,
    follower: follower[0],
    following: following[0]
  }
  return(data);
};

const selectProgressBasicInfo = async (progressId) => {
  let progressBasicInfo = await pool.query(`SELECT name, category, motivation FROM progress WHERE id=${progressId}`);
  let firstDiary = await pool.query(`SELECT MIN(date) FROM diary WHERE progress_id=${progressId}`);
  let progressInfo = {
    name: progressBasicInfo[0][0].name,
    category: progressBasicInfo[0][0].category,
    motivation: progressBasicInfo[0][0].motivation,
    firstDiaryDate: firstDiary[0][0]['MIN(date)']
  }
  return (progressInfo);
};

const addGroupProgress = async (progressData) => {
  let result  = await pool.query('INSERT INTO group_progress SET ?', progressData);
  let groupProgressId = result[0].insertId;
  return groupProgressId;
}

const isnertGroupProgressUser = async (userID, groupProgressID) => {
  let data = {
    user_id: userID,
    group_progress_id: groupProgressID
  }
  //先檢查該團體有沒有超過八個人或重複加入
  let member = await pool.query(`SELECT user_id FROM group_progress_user WHERE group_progress_id = ${groupProgressID}`)
  if (member[0].length == 8) {
    return "群組人數達上限"
  } else {
    //避免重複加入
    let memberArr=[];
    for (let i in member[0]) {
      memberArr.push(member[0][i].user_id);
    } 
    if (memberArr.indexOf(userID.toString()) == -1) {
      let result  = await pool.query('INSERT INTO group_progress_user SET ?', data);
    }
  }
};

const insertGroupRoomID = async (roomID, groupProgressID) => {
  let result  = await pool.query(`UPDATE group_progress SET room_id=${roomID} WHERE id=${groupProgressID}`);
}

const selectGroupProgressBasicInfo = async (userID, groupProgressID) => {
  let result = await pool.query(`SELECT * FROM group_progress WHERE id=${groupProgressID}`);
  result[0][0].picture = `${process.env.IMAGE_PATH}${result[0][0].picture}`;
  let result2 = await pool.query(`SELECT group_progress_user.percent, group_progress_user.last_date, users.id, users.name, users.photo FROM group_progress_user JOIN users ON group_progress_user.user_id = users.id WHERE group_progress_user.group_progress_id = ${groupProgressID} ORDER BY percent DESC, last_date ASC`);
  for (let i in result2[0]) {
    result2[0][i].photo = `${process.env.IMAGE_PATH}${result2[0][i].photo}`
  }
  let result3 = await pool.query(`SELECT date, data_verb, data_num, data_unit FROM group_progress_diary WHERE user_id=${userID} AND group_progress_id = ${groupProgressID} ORDER BY date DESC`);
  let result4 = await pool.query(`SELECT SUM(data_num) FROM group_progress_diary WHERE user_id=${userID} AND group_progress_id = ${groupProgressID}`);
  let data = {
    basicInfo: result[0][0],
    members: result2[0],
    personalDiary: result3[0],
    personalSum: result4[0][0]['SUM(data_num)']
  };
  return (data);
};

const addGroupPersonalProgress = async (personalData) => {
  //先選看看有沒有再加
  let result = await pool.query(`SELECT * FROM group_progress_diary WHERE user_id=${personalData.user_id} AND date='${personalData.date}' AND group_progress_id = ${personalData.group_progress_id}`);
  if (result[0].length == 0) {
    await pool.query("INSERT INTO group_progress_diary SET?", personalData);
  } else if (result[0].length !== 0) {
    let sqlValue = [`${personalData.data_num}`];
    await pool.query(`UPDATE group_progress_diary SET data_num=? WHERE user_id=${personalData.user_id} AND date='${personalData.date}'`, sqlValue);
  }
  //更新group_progress_user table
  //先選出progress goal
  let result4 = await pool.query(`SELECT goal_num FROM group_progress WHERE id=${personalData.group_progress_id}`);
  let goalNumber = result4[0][0].goal_num;
  //選出user加總
  let result5 = await pool.query(`SELECT SUM(data_num) FROM group_progress_diary WHERE user_id = ${personalData.user_id} AND group_progress_id = ${personalData.group_progress_id}`);
  let dataSum = result5[0][0]['SUM(data_num)'];
  let percent = Math.round(parseInt(dataSum)/parseInt(goalNumber)*100);
  if (percent > 100) {
    percent = 100;
  }
  await pool.query (`UPDATE group_progress_user SET last_date='${personalData.date}', percent=${percent} WHERE user_id=${personalData.user_id} and group_progress_id=${personalData.group_progress_id}`);
};

const editGroupProgress = async (progressData) => {
  let {ID, name, motivation, category, startDate, endDate, goalVerb, goalNum, goalUnit, picture} = progressData;
  let sqlValue = [`${name}`, `${motivation}`, `${category}`, `${startDate}`, `${endDate}`, `${goalVerb}`, `${goalNum}`, `${goalUnit}`, `${picture}`];
  await pool.query(`UPDATE group_progress SET name =?, motivation=?, category=?, start_date=?, end_date=?, goal_verb=?, goal_num=?, goal_unit=?, picture=? WHERE id='${ID}'`,sqlValue);
};

const selectGroupProgressIDRoomID = async (invitationCode) => {
  let groupProgressIDRoomID;
  let result = await pool.query(`SELECT id, room_id FROM group_progress WHERE invitation_code ='${invitationCode}'`);
  if (result[0].length > 0) {
    groupProgressIDRoomID  = result[0][0]
  }
  return groupProgressIDRoomID;
};

const selectMyProgress = async (identity, authorID) => {
  //個人的部分
  let personalProgressArr;
  if (identity == 'author') {
    let result = await pool.query(`SELECT * FROM progress WHERE user_id=${authorID} ORDER BY id DESC`);
    personalProgressArr = result[0];
  } else {
    // 只選公開的
    let result = await pool.query(`SELECT * FROM progress WHERE user_id=${authorID} AND public NOT IN ('1') ORDER BY id DESC`);
    personalProgressArr = result[0];
  }
  for (let i in personalProgressArr) {
    personalProgressArr[i].picture = `${process.env.IMAGE_PATH}${personalProgressArr[i].picture}`;
  }
  //選群組Progress
  let groupProgressArr;
  let result = await pool.query(`SELECT group_progress.* FROM group_progress JOIN group_progress_user ON group_progress_user.group_progress_id = group_progress.id WHERE group_progress_user.user_id =${authorID} ORDER BY group_progress.start_date DESC`);
  groupProgressArr = result[0];
  for (let k in groupProgressArr) {
    groupProgressArr[k].picture = `${process.env.IMAGE_PATH}${groupProgressArr[k].picture}`
  }
  let data = {
    personal: personalProgressArr,
    group: groupProgressArr
  }
  return(data);
}

const selectNewProgress = async () => {
  let selectEight = async (category) => {
    let result = await pool.query(`SELECT * FROM (
      SELECT * FROM progress WHERE category ="${category}" AND public NOT IN ('1') ORDER BY id DESC LIMIT 8 
    )Var1
      ORDER BY id ASC`)
    for (let i in result[0]) {
      result[0][i].picture = `${process.env.IMAGE_PATH}${result[0][i].picture}`
    }
    return result[0];
  }
  let sport = await selectEight('運動');
  let growth = await selectEight('成長');
  let outlook = await selectEight('體態外表');
  let garden = await selectEight('園藝');
  let learn = await selectEight('學習');
  let house = await selectEight('居家');
  let cook = await selectEight('烹飪');
  let art = await selectEight('作品');
  let data = {
    sport,
    growth,
    outlook,
    garden,
    learn,
    house,
    cook,
    art,
  }
  return data;
};

const selectProgressCategory = async (requestInfo) => {
  let category = requestInfo.category;
  let sqlValue = [category];
  let result = await pool.query(`SELECT * FROM progress WHERE category=? AND public NOT IN ('1') ORDER BY id DESC`, sqlValue);
  for (let i in result[0]) {
    result[0][i].picture = `${process.env.IMAGE_PATH}${result[0][i].picture}`
  }
  let data = {
    data:result[0]
  }
  return data;
};

const selectProgressSearch = async (requestInfo) => {
  let keyword = requestInfo.keyword;
  let sqlValue = [`%${keyword}%`];
  let result = await pool.query(`SELECT * FROM progress WHERE name LIKE ? AND public NOT IN ('1') ORDER BY id DESC`, sqlValue);
  for (let i in result[0]) {
    result[0][i].picture = `${process.env.IMAGE_PATH}${result[0][i].picture}`
  }
  let data = {
    data:result[0]
  }
  return data;
};


const finishProgress = async (request) => {
  let updateStatus = request.status;
  let progressID = request.progressid;
  await pool.query(`UPDATE progress SET status=${updateStatus} WHERE id=${progressID}`);
};

module.exports = {
  addProgress,
  addProgressData,
  selectProgress,
  selectProgressWithDiarys,
  editProgress,
  editProgressData,
  selectDiaryId,
  selectProgressAuthor,
  selectProgressBasicInfo,
  selectProgressWithDiarysVistor,
  addGroupProgress,
  isnertGroupProgressUser,
  insertGroupRoomID,
  selectGroupProgressBasicInfo,
  addGroupPersonalProgress,
  editGroupProgress,
  selectGroupProgressIDRoomID,
  selectMyProgress,
  selectNewProgress,
  selectProgressCategory,
  selectProgressSearch,
  finishProgress
}
