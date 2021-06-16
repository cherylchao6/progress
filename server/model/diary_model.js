/* eslint-disable no-useless-catch */
require("dotenv").config();
const { pool } = require("./mysql");

const addDiary = async (diaryData) => {
  const result = await pool.query("INSERT INTO diary SET ?", diaryData);
  const diaryId = result[0].insertId;
  return diaryId;
};

const addDiaryData = async (diaryDataArray) => {
  const sqlArray = [];
  for (const i in diaryDataArray) {
    const inputArray = [];
    inputArray.push(diaryDataArray[i].diary_id);
    inputArray.push(diaryDataArray[i].name);
    inputArray.push(parseInt(diaryDataArray[i].value));
    inputArray.push(diaryDataArray[i].unit);
    sqlArray.push(inputArray);
  }
  await pool.query("INSERT INTO diary_data (diary_id, name, value, unit) VALUES ?", [sqlArray]);
};

const addDiaryImages = async (sqlArray) => {
  await pool.query("INSERT INTO diary_images (diary_id, path) VALUES ?", [sqlArray]);
};

const selectDiary = async (diaryid) => {
  const diaryBasicInfo = await pool.query(`SELECT progress_id, date, content, mood, main_image FROM diary WHERE id=${diaryid}`);
  diaryBasicInfo[0][0].fileName = diaryBasicInfo[0][0].main_image;
  diaryBasicInfo[0][0].main_image = `${process.env.IMAGE_PATH}${diaryBasicInfo[0][0].main_image}`;
  const diaryInputData = await pool.query(`SELECT name, value, unit FROM diary_data WHERE diary_id=${diaryid}`);
  const diaryImages = await pool.query(`SELECT path FROM diary_images WHERE diary_id=${diaryid}`);
  for (const i in diaryImages[0]) {
    diaryImages[0][i].fileName = diaryImages[0][i].path;
    diaryImages[0][i].path = `${process.env.IMAGE_PATH}${diaryImages[0][i].path}`;
  }
  const diaryData = {
    basicInfo: diaryBasicInfo[0][0],
    inputData: diaryInputData[0],
    images: diaryImages[0]
  };
  return diaryData;
};

const editDiary = async (editDiaryData) => {
  const { date, mood, content, year, month, day, main_image, diary_id } = editDiaryData;
  const sqlValue = [`${date}`, `${mood}`, `${content}`, `${year}`, `${month}`, `${day}`, `${main_image}`];
  await pool.query(`UPDATE diary SET date=?, mood=?, content=?, year=?, month=?, day=?, main_image=? WHERE id='${diary_id}'`, sqlValue);
};

const deleteDiaryImages = async (diaryid) => {
  await pool.query(`DELETE FROM diary_images WHERE diary_id = ${diaryid}`);
};

const deleteDiaryData = async (diaryid) => {
  await pool.query(`DELETE FROM diary_data WHERE diary_id = ${diaryid}`);
};

const deleteDiaryDataNotInProgress = async (data) => {
  const { diaryId, name } = data;
  await pool.query(`DELETE FROM diary_data WHERE diary_id = ${diaryId} AND name='${name}'`);
};

const editDiaryData = async (diaryDataArray) => {
  for (const i in diaryDataArray) {
    const { diary_id, name, value, unit } = diaryDataArray[i];
    const sqlValue = [name, value, unit];
    await pool.query(`UPDATE diary_data SET name=?, value=?, unit=? WHERE diary_id='${diary_id}' AND name='${name}'`, sqlValue);
  }
};

const selectDiaryTime = async (progressId) => {
  const arr = await pool.query(`SELECT year, month, day FROM diary WHERE progress_id =${progressId} ORDER BY date`);
  const output = {};
  for (const a of arr[0]) {
    if (output[a.year]) {
      if (output[a.year][a.month - 1]) {
        output[a.year][a.month - 1][a.month].push(a.day);
      } else {
        output[a.year][a.month - 1] = {};
        output[a.year][a.month - 1][a.month] = [];
        output[a.year][a.month - 1][a.month].push(a.day);
      }
    } else {
      const year = output[a.year] = [];
      if (year[a.month - 1]) {
        year[a.month - 1][a.month].push(a.day);
      } else {
        year[a.month - 1] = {};
        year[a.month - 1][a.month] = [];
        year[a.month - 1][a.month].push(a.day);
      }
    }
  }
  return (output);
};

const selectDiarys = async (diaryid) => {
  const diaryBasicInfo = await pool.query(`SELECT progress_id, date, content, mood, main_image FROM diary WHERE id=${diaryid}`);
  diaryBasicInfo[0][0].fileName = diaryBasicInfo[0][0].main_image;
  diaryBasicInfo[0][0].main_image = `${process.env.IMAGE_PATH}${diaryBasicInfo[0][0].main_image}`;
  const diaryInputData = await pool.query(`SELECT name, value, unit FROM diary_data WHERE diary_id=${diaryid}`);
  const diaryImages = await pool.query(`SELECT path FROM diary_images WHERE diary_id=${diaryid}`);
  for (const i in diaryImages[0]) {
    diaryImages[0][i].fileName = diaryImages[0][i].path;
    diaryImages[0][i].path = `${process.env.IMAGE_PATH}${diaryImages[0][i].path}`;
  }
  const diaryData = {
    basicInfo: diaryBasicInfo[0][0],
    inputData: diaryInputData[0],
    images: diaryImages[0]
  };
  return diaryData;
};

const selectDiaryMood = async (request) => {
  let data;
  const { year, month, progressid } = request;
  if (year == "All" && month == "All") {
    const moodData = await pool.query(`SELECT SUM(mood)/COUNT(*), year FROM diary WHERE progress_id = ${progressid} AND NOT mood ='0' GROUP BY year`);
    const yearArray = [];
    const moodArray = [];
    for (const i in moodData[0]) {
      yearArray.push(moodData[0][i].year);
      moodArray.push(moodData[0][i]["SUM(mood)/COUNT(*)"]);
    }
    data = {
      Xs: yearArray,
      Ys: moodArray
    };
    return (data);
  } else if (month == "All") {
    const moodData = await pool.query(`SELECT SUM(mood)/COUNT(*), month FROM diary WHERE progress_id = ${progressid} AND year = ${year} AND NOT mood ='0' GROUP BY month`);
    const monthArray = [];
    const moodArray = [];
    for (const i in moodData[0]) {
      monthArray.push(`${moodData[0][i].month}月`);
      moodArray.push(moodData[0][i]["SUM(mood)/COUNT(*)"]);
    }
    data = {
      Xs: monthArray,
      Ys: moodArray
    };
    return (data);
  } else {
    const moodData = await pool.query(`SELECT mood, day FROM diary WHERE progress_id = ${progressid} AND year = ${year} AND month = ${month} AND NOT mood ='0' ORDER BY day`);
    const dayArray = [];
    const moodArray = [];
    for (const i in moodData[0]) {
      dayArray.push(moodData[0][i].day);
      moodArray.push(moodData[0][i].mood);
    }
    data = {
      Xs: dayArray,
      Ys: moodArray
    };
    return (data);
  }
};

const selectDiaryChart = async (request) => {
  let data;
  const { year, month, datatype, progressid } = request;
  if (year == "All" && month == "All") {
    const result = await pool.query(`SELECT SUM(diary_data.value)/count(*), diary.year FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND diary_data.name='${datatype}' GROUP BY year`);
    const yearArray = [];
    const valueArray = [];
    for (const i in result[0]) {
      yearArray.push(result[0][i].year);
      valueArray.push(result[0][i]["SUM(diary_data.value)/count(*)"]);
    }
    data = {
      Xs: yearArray,
      Ys: valueArray
    };
    return (data);
  } else if (month == "All") {
    const result = await pool.query(`SELECT SUM(diary_data.value)/count(*), diary.month FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND year = ${year} AND diary_data.name='${datatype}' GROUP BY month`);
    const monthArray = [];
    const valueArray = [];
    for (const i in result[0]) {
      monthArray.push(`${result[0][i].month}月`);
      valueArray.push(result[0][i]["SUM(diary_data.value)/count(*)"]);
    }
    data = {
      Xs: monthArray,
      Ys: valueArray
    };
    return (data);
  } else {
    const result = await pool.query(`SELECT SUM(diary_data.value)/count(*), diary.day FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND year = ${year} AND month = ${month} AND diary_data.name='${datatype}' GROUP BY day`);
    const dayArray = [];
    const valueArray = [];
    for (const i in result[0]) {
      dayArray.push(result[0][i].day);
      valueArray.push(result[0][i]["SUM(diary_data.value)/count(*)"]);
    }
    data = {
      Xs: dayArray,
      Ys: valueArray
    };
    return (data);
  }
};

const selectDiaryPage = async (request) => {
  let data;
  const { year, month, progressid, page } = request;
  if (year == "All" && month == "All") {
    const result = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} ORDER BY date DESC LIMIT ${page},8`);
    for (const i in result[0]) {
      result[0][i].main_image = `${process.env.IMAGE_PATH}${result[0][i].main_image}`;
    }
    const allResults = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid}`);
    const allResultsLength = allResults[0].length;
    const allPages = Math.ceil(allResultsLength / 8);
    data = {
      allPages,
      allResultsLength,
      diarys: result[0]
    };
    return (data);
  } else if (month == "All") {
    const result = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} ORDER BY date DESC LIMIT ${page},8`);
    for (const i in result[0]) {
      result[0][i].main_image = `${process.env.IMAGE_PATH}${result[0][i].main_image}`;
    }
    const allResults = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year}`);
    const allResultsLength = allResults[0].length;
    const allPages = Math.ceil(allResultsLength / 8);
    data = {
      allPages,
      allResultsLength,
      diarys: result[0]
    };
    return (data);
  } else {
    const result = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} AND month = ${month} ORDER BY date DESC LIMIT ${page},8`);
    for (const i in result[0]) {
      result[0][i].main_image = `${process.env.IMAGE_PATH}${result[0][i].main_image}`;
    }
    const allResults = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} AND month = ${month}`);
    const allResultsLength = allResults[0].length;
    const allPages = Math.ceil(allResultsLength / 8);
    data = {
      allPages,
      allResultsLength,
      diarys: result[0]
    };
    return (data);
  }
};

module.exports = {
  addDiary,
  addDiaryData,
  addDiaryImages,
  editDiary,
  selectDiary,
  selectDiarys,
  deleteDiaryImages,
  deleteDiaryData,
  editDiaryData,
  deleteDiaryDataNotInProgress,
  selectDiaryTime,
  selectDiaryChart,
  selectDiaryMood,
  selectDiaryPage
};
