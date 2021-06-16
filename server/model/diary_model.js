require('dotenv').config();
const { pool } = require('./mysql');



const addDiary = async (diaryData)=> {
  try {
    let result = await pool.query('INSERT INTO diary SET ?', diaryData);
    let diaryId = result[0].insertId;
    return diaryId;
} catch (error) {
    console.log(error);
    return {error};
}
};

const addDiaryData = async (diaryDataArray)=> {
  try {
    let sqlArray = [];
    for (let i in diaryDataArray) {
      let inputArray = [];
      inputArray.push(diaryDataArray[i]['diary_id']);
      inputArray.push(diaryDataArray[i]['name']);
      inputArray.push(parseInt(diaryDataArray[i]['value']));
      inputArray.push(diaryDataArray[i]['unit']);
      sqlArray.push(inputArray);
    }
    let result = await pool.query('INSERT INTO diary_data (diary_id, name, value, unit) VALUES ?', [sqlArray]);
    console.log(result);
} catch (error) {
    console.log(error);
    return {error};
}
};

const addDiaryImages = async (sqlArray)=> {
  try {
    await pool.query('INSERT INTO diary_images (diary_id, path) VALUES ?', [sqlArray]);
} catch (error) {
    console.log(error);
    return {error};
}
};

const selectDiary = async (diaryid)=> {
  try {
    let diaryBasicInfo = await pool.query(`SELECT progress_id, date, content, mood, main_image FROM diary WHERE id=${diaryid}`);
    diaryBasicInfo[0][0].fileName = diaryBasicInfo[0][0]['main_image'];
    diaryBasicInfo[0][0]['main_image'] = `${process.env.IMAGE_PATH}${diaryBasicInfo[0][0]['main_image']}`;
    let diaryInputData = await pool.query(`SELECT name, value, unit FROM diary_data WHERE diary_id=${diaryid}`);
    let diaryImages = await pool.query(`SELECT path FROM diary_images WHERE diary_id=${diaryid}`);
    for (let i in diaryImages[0]){
      diaryImages[0][i].fileName = diaryImages[0][i].path;
      diaryImages[0][i].path = `${process.env.IMAGE_PATH}${diaryImages[0][i].path}`;
    }
    let diaryData = {
      basicInfo: diaryBasicInfo[0][0],
      inputData: diaryInputData[0],
      images: diaryImages[0]
    }
    return diaryData;
} catch (error) {
    console.log(error);
    return {error};
}
};

const editDiary = async (editDiaryData) => {
  try {
    let {date, mood, content, year, month, day, main_image, diary_id} = editDiaryData;
    let sqlValue = [`${date}`, `${mood}`, `${content}`, `${year}`, `${month}`, `${day}`, `${main_image}`];
    let result = await pool.query(`UPDATE diary SET date=?, mood=?, content=?, year=?, month=?, day=?, main_image=? WHERE id='${diary_id}'`, sqlValue);
} catch (error) {
    console.log(error);
    return {error};;
}
};

const deleteDiaryImages = async (diaryid) => {
  try {
    await pool.query (`DELETE FROM diary_images WHERE diary_id = ${diaryid}`);
} catch (error) {
    console.log(error);
    return {error};
}
};

const deleteDiaryData = async (diaryid) => {
  try {
    await query (`DELETE FROM diary_data WHERE diary_id = ${diaryid}`);
} catch (error) {
    console.log(error);
    return {error};
}
};

const deleteDiaryDataNotInProgress = async (data) => {
  try {
    let {diaryId, name} = data
    await pool.query (`DELETE FROM diary_data WHERE diary_id = ${diaryId} AND name='${name}'`);
} catch (error) {
    console.log(error);
    return {error};
}
};

const editDiaryData = async (diaryDataArray) => {
  try {
    for (let i in diaryDataArray) {
      let {diary_id, name, value, unit} = diaryDataArray[i]
      let sqlValue = [name, value, unit];
      await pool.query (`UPDATE diary_data SET name=?, value=?, unit=? WHERE diary_id='${diary_id}' AND name='${name}'`, sqlValue);
    }   
} catch (error) {
    console.log(error);
    return {error};
}
};

const selectDiaryTime = async (progressId) => {
  try {
    let arr = await pool.query (`SELECT year, month, day FROM diary WHERE progress_id =${progressId} ORDER BY date`);
    let output = {};
    for (let a of arr[0]) {
        if(output[a.year]) {
            if (output[a.year][a.month -1]){
                output[a.year][a.month -1][a.month].push(a.day);
            } else {
                output[a.year][a.month -1] = {};
                output[a.year][a.month -1][a.month] = [];
                output[a.year][a.month -1][a.month].push(a.day);
            }
        } else {
            let year = output[a.year] = [];
            if (year[a.month -1]){
                year[a.month -1][a.month].push(a.day);
            } else {
                year[a.month -1] = {};
                year[a.month -1][a.month] = [];
                year[a.month -1][a.month].push(a.day);
            }
        }
    }
    return(output);
} catch (error) {
    console.log(error);
    return {error};
}
};


const selectDiarys = async (diaryid)=> {
  try {
    let diaryBasicInfo = await pool.query(`SELECT progress_id, date, content, mood, main_image FROM diary WHERE id=${diaryid}`);
    diaryBasicInfo[0][0].fileName = diaryBasicInfo[0][0]['main_image'];
    diaryBasicInfo[0][0]['main_image'] = `${process.env.IMAGE_PATH}${diaryBasicInfo[0][0]['main_image']}`;
    let diaryInputData = await query(`SELECT name, value, unit FROM diary_data WHERE diary_id=${diaryid}`);
    let diaryImages = await query(`SELECT path FROM diary_images WHERE diary_id=${diaryid}`);
    for (let i in diaryImages[0]){
      diaryImages[0][i].fileName = diaryImages[0][i].path;
      diaryImages[0][i].path = `${process.env.IMAGE_PATH}${diaryImages[0][i].path}`
    }
    let diaryData = {
      basicInfo: diaryBasicInfo[0][0],
      inputData: diaryInputData[0],
      images: diaryImages[0]
    }
    return diaryData;
} catch (error) {
    console.log(error);
    return {error};
}
};

const selectDiaryMood = async (request)=> {
  try {
    let data;
    let {year, month, progressid} = request;
    if (year == "All" && month == "All") {
      let moodData = await pool.query (`SELECT SUM(mood)/COUNT(*), year FROM diary WHERE progress_id = ${progressid} AND NOT mood ='0' GROUP BY year`);
      let yearArray = [];
      let moodArray = [];
      for (let i in moodData[0]) {
        yearArray.push(moodData[0][i].year);
        moodArray.push(moodData[0][i]['SUM(mood)/COUNT(*)'])
      }
      data = {
        Xs: yearArray,
        Ys: moodArray
      }
      return (data);
    } else if (month == "All") {
      let moodData = await pool.query (`SELECT SUM(mood)/COUNT(*), month FROM diary WHERE progress_id = ${progressid} AND year = ${year} AND NOT mood ='0' GROUP BY month`)
      let monthArray = [];
      let moodArray = [];
      for (let i in moodData[0]) {
        monthArray.push(`${moodData[0][i].month}月`);
        moodArray.push(moodData[0][i]['SUM(mood)/COUNT(*)'])
      }
      data = {
        Xs: monthArray,
        Ys: moodArray
      }
      return (data);
    } else {
      let moodData = await pool.query (`SELECT mood, day FROM diary WHERE progress_id = ${progressid} AND year = ${year} AND month = ${month} AND NOT mood ='0' ORDER BY day`)
      let dayArray = [];
      let moodArray = [];
      for (let i in moodData[0]) {
        dayArray.push(moodData[0][i].day);
        moodArray.push(moodData[0][i].mood);
      }
      data = {
        Xs: dayArray,
        Ys: moodArray
      }
      return (data);
    }
} catch (error) {
    console.log(error);
    return {error};
}
};

const selectDiaryChart = async (request) => {
  try {
    let data;
    let {year, month, datatype, progressid} = request;
    if (year == "All" && month == "All") {
      let result = await pool.query (`SELECT SUM(diary_data.value)/count(*), diary.year FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND diary_data.name='${datatype}' GROUP BY year`)
      let yearArray = [];
      let valueArray = [];
      for (let i in result[0]) {
        yearArray.push(result[0][i].year);
        valueArray.push(result[0][i]['SUM(diary_data.value)/count(*)'])
      }
      data = {
        Xs: yearArray,
        Ys: valueArray
      }
      return (data);
    } else if (month == "All") {
      let result = await pool.query (`SELECT SUM(diary_data.value)/count(*), diary.month FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND year = ${year} AND diary_data.name='${datatype}' GROUP BY month`)
      let monthArray = [];
      let valueArray = [];
      for (let i in result[0]) {
        monthArray.push(`${result[0][i].month}月`);
        valueArray.push(result[0][i]['SUM(diary_data.value)/count(*)'])
      }
      data = {
        Xs: monthArray,
        Ys: valueArray
      }
      return (data);
    } else {
      let result = await pool.query (`SELECT SUM(diary_data.value)/count(*), diary.day FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND year = ${year} AND month = ${month} AND diary_data.name='${datatype}' GROUP BY day`);
      let dayArray = [];
      let valueArray = [];
      for (let i in result[0]) {
        dayArray.push(result[0][i].day);
        valueArray.push(result[0][i]['SUM(diary_data.value)/count(*)'])
      }
      data = {
        Xs: dayArray,
        Ys: valueArray
      }
      return (data);
    }
    // return(output); 
} catch (error) {
    console.log(error);
    return {error};
}
};

const selectDiaryPage = async (request) => {
  try {
    let data;
    let {year, month, progressid, page} = request;
    if (year == "All" && month == "All") {
      let result = await pool.query (`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} ORDER BY date DESC LIMIT ${page},8`);
      for (let i in result[0]) {
        result[0][i].main_image = `${process.env.IMAGE_PATH}${result[0][i].main_image}`
      }
      let allResults = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid}`);
      let allResultsLength = allResults[0].length;
      let allPages = Math.ceil(allResultsLength/8);
      data = {
        allPages,
        allResultsLength,
        diarys: result[0]
      };
      return (data);
    } else if (month == "All") {
      let result = await pool.query (`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} ORDER BY date DESC LIMIT ${page},8`);
      for (let i in result[0]) {
        result[0][i].main_image = `${process.env.IMAGE_PATH}${result[0][i].main_image}`
      }
      let allResults = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year}`);
      let allResultsLength = allResults[0].length;
      let allPages = Math.ceil(allResultsLength/8);
      data = {
        allPages,
        allResultsLength,
        diarys: result[0]
      }
      return (data);
    } else {
      let result = await pool.query (`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} AND month = ${month} ORDER BY date DESC LIMIT ${page},8`);
      for (let i in result[0]) {
        result[0][i].main_image = `${process.env.IMAGE_PATH}${result[0][i].main_image}`
      }
      let allResults = await pool.query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} AND month = ${month}`);
      let allResultsLength = allResults[0].length;
      let allPages = Math.ceil(allResultsLength/8);
      data = {
        allPages,
        allResultsLength,
        diarys: result[0]
      }
      return(data);
    }
} catch (error) {
    console.log(error);
    return {error};
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