const { response } = require('express');
const { query } = require ('./mysql');

const addProgress = async (addProgress) => {
  try {
      await query('INSERT INTO progress SET ?', addProgress);
  } catch (error) {
      console.log(error);
      return {error};
  }
}

const selectProgress = async (progressId) => {
  try {
    let id = progressId.progressid;
    let progressData = await query(`SELECT name, category, motivation, public, picture FROM progress WHERE id=${id}`);
    return progressData[0];
  } catch (error) {
      console.log(error);
      return {error};
  }
}

const editProgress = async (editProgressData) => {
  try {
    console.log(editProgressData);
    let {progressId, name, motivation, category, picture, public} = editProgressData;
    let result = await query(`UPDATE progress SET name ='${name}', motivation='${motivation}', category='${category}', picture='${picture}', public='${public}' WHERE id='${progressId}'`);
    console.log(result);
  } catch (error) {
      console.log(error);
      return {error};
  }
}



module.exports = {
  addProgress,
  selectProgress,
  editProgress
}
