const { response } = require('express');
const { query } = require ('./mysql');

const addProgress = async (addProgress) => {
  try {
      let result  = await query('INSERT INTO progress SET ?', addProgress);
      let progressId = result.insertId;
      return progressId;
  } catch (error) {
      console.log(error);
      return {error};
  }
}

const addProgressData = async (progressDataArray) => {
  try {
      let sqlArray = [];
      for (let i in progressDataArray){
        let inputArray = [];
        inputArray.push(progressDataArray[i]['progress_id']);
        inputArray.push(progressDataArray[i]['name']);
        inputArray.push(progressDataArray[i]['unit']);
        sqlArray.push(inputArray);
      }
      await query('INSERT INTO progress_data (progress_id, name, unit) VALUES ?', [sqlArray]);
  } catch (error) {
      console.log(error);
      return {error};
  }
}

const selectProgress = async (progressId) => {
  try {
    let id = progressId.progressid;
    let progress = await query(`SELECT name, category, motivation, public, picture FROM progress WHERE id=${id}`);
    let progressData = await query(`SELECT name, unit FROM progress_data WHERE progress_id=${id}`);
    let progressInfo = {
      progress: progress[0],
      progressData: progressData
    };
    return progressInfo;
  } catch (error) {
      console.log(error);
      return {error};
  }
};

const selectProgressWithDiarys = async (progressId) => {
  try {
    let progress = await query(`SELECT name, category, motivation, public, picture, status FROM progress WHERE id=${progressId}`);
    progress[0].picture = `${process.env.IMAGE_PATH}${progress[0].picture}`
    let progressData = await query(`SELECT name, unit FROM progress_data WHERE progress_id=${progressId}`);
    let diarys = await query(`SELECT date, main_image FROM diary WHERE progress_id=${progressId} ORDER BY date`);
    for ( let i in diarys) {
      diarys[i].main_image = `${process.env.IMAGE_PATH}${diarys[i].main_image}`
    }
    let data = {
      name: progress[0].name,
      category: progress[0].category,
      motivation: progress[0].motivation,
      public: progress[0].public,
      status: progress[0].status,
      picture: progress[0].picture,
      datatype: progressData,
      diarys: diarys,
    };
    return data;
  } catch (error) {
      console.log(error);
      return {error};
  }
};

const selectProgressWithDiarysVistor = async (progressId) => {
  try {
    let progress = await query(`SELECT name, category, motivation, public, picture, status FROM progress WHERE id=${progressId} and public = "0"`);
    console.log(progress);
    if (progress.length !== 0) {
      progress[0].picture = `${process.env.IMAGE_PATH}${progress[0].picture}`
      let progressData = await query(`SELECT name, unit FROM progress_data WHERE progress_id=${progressId}`);
      let diarys = await query(`SELECT date, main_image FROM diary WHERE progress_id=${progressId} ORDER BY date`);
      for ( let i in diarys) {
        diarys[i].main_image = `${process.env.IMAGE_PATH}${diarys[i].main_image}`
      }
      let data = {
        name: progress[0].name,
        category: progress[0].category,
        motivation: progress[0].motivation,
        public: progress[0].public,
        status: progress[0].status,
        picture: progress[0].picture,
        datatype: progressData,
        diarys: diarys,
      };
      return data;
    } else {
      let data = {};
    }
    
  } catch (error) {
      console.log(error);
      return {error};
  }
}

const selectDiaryId = async (progressId) => {
  try {
    let DiaryIdOfProgress = await query(`SELECT id FROM diary WHERE progress_id=${progressId}`);
    let diaryIdArray = [];
    if (DiaryIdOfProgress.length !== 0) {
      for (let i in DiaryIdOfProgress) {
        diaryIdArray.push(DiaryIdOfProgress[i].id);
      }
    }
    return (diaryIdArray);
  } catch (error) {
      console.log(error);
      return {error};
  }
}

const editProgress = async (editProgressData) => {
  try {
    let {progressId, name, motivation, category, picture, public} = editProgressData;
    let result = await query(`UPDATE progress SET name ='${name}', motivation='${motivation}', category='${category}', picture='${picture}', public='${public}' WHERE id='${progressId}'`);
  } catch (error) {
      console.log(error);
      return {error};
  }
}

const editProgressData = async (progressData) => {
  try {
    let {progress_id} =  progressData;
    await query(`DELETE FROM progress_data WHERE progress_id=${progress_id}`);
    let sqlArray = [];
      for (let i in progressData.data){
        let inputArray = [];
        inputArray.push(progressData.data[i]['progress_id']);
        inputArray.push(progressData.data[i]['name']);
        inputArray.push(progressData.data[i]['unit']);
        sqlArray.push(inputArray);
      }
      await query('INSERT INTO progress_data (progress_id, name, unit) VALUES ?', [sqlArray]);
    
} catch (error) {
    console.log(error);
    return {error};
  }
};

const selectProgressAuthor = async (progressid) => {
  try {
    let authorid = await query (`SELECT user_id FROM progress WHERE id = ${progressid}`);
    let authorProfile = await query (`SELECT id, name, photo, motto FROM users WHERE id=${authorid[0].user_id}`);
    let finishedProgress = await query (`SELECT id FROM progress WHERE user_id=${authorid[0].user_id} AND status =1`);
    let follower = await query (`SELECT follower_id FROM follow WHERE following_id = ${authorid[0].user_id}`);
    let following = await query (`SELECT following_id FROM follow WHERE follower_id = ${authorid[0].user_id}`);
    let data = {
      author: authorProfile[0].id,
      name: authorProfile[0].name,
      photo: `${process.env.IMAGE_PATH}${authorProfile[0].photo}`,
      motto: authorProfile[0].motto,
      finishedProgress: finishedProgress.length,
      follower: follower.length,
      following: following.length,
    }
    return(data);
} catch (error) {
    console.log(error);
    return {error};
  }
};

const selectProgressBasicInfo = async (progressId) => {
  try {
    let progressBasicInfo = await query(`SELECT name, category, motivation FROM progress WHERE id=${progressId}`);
    let firstDiary = await query(`SELECT MIN(date) FROM diary WHERE progress_id=${progressId}`);
    let progressInfo = {
      name: progressBasicInfo[0].name,
      category: progressBasicInfo[0].category,
      motivation: progressBasicInfo[0].motivation,
      firstDiaryDate: firstDiary[0]['MIN(date)']
    }
    return (progressInfo);
  } catch (error) {
      console.log(error);
      return {error};
  }
}

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
  selectProgressWithDiarysVistor
}
