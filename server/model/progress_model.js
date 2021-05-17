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

module.exports = {
  addProgress,
  addProgressData,
  selectProgress,
  editProgress,
  editProgressData
}
