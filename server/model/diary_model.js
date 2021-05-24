require('dotenv').config();
const { query } = require('./mysql');



const addDiary = async (diaryData)=> {
  try {
    let result = await query('INSERT INTO diary SET ?', diaryData);
    let diaryId = result.insertId;
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
    await query('INSERT INTO diary_data (diary_id, name, value, unit) VALUES ?', [sqlArray]);
} catch (error) {
    console.log(error);
    return {error};
}
};

const addDiaryImages = async (sqlArray)=> {
  try {
    await query('INSERT INTO diary_images (diary_id, path) VALUES ?', [sqlArray]);
} catch (error) {
    console.log(error);
    return {error};
}
};

const selectDiary = async (diaryid)=> {
  try {
    let diaryBasicInfo = await query(`SELECT progress_id, date, content, mood, main_image FROM diary WHERE id=${diaryid}`);
    diaryBasicInfo[0].fileName = diaryBasicInfo[0]['main_image'];
    diaryBasicInfo[0]['main_image'] = `${process.env.IMAGE_PATH}${diaryBasicInfo[0]['main_image']}`;
    let diaryInputData = await query(`SELECT name, value, unit FROM diary_data WHERE diary_id=${diaryid}`);
    let diaryImages = await query(`SELECT path FROM diary_images WHERE diary_id=${diaryid}`);
    for (let i in diaryImages){
      diaryImages[i].fileName = diaryImages[i].path;
      diaryImages[i].path = `${process.env.IMAGE_PATH}${diaryImages[i].path}`
    }
    let diaryData = {
      basicInfo: diaryBasicInfo[0],
      inputData: diaryInputData,
      images: diaryImages
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
    let result = await query(`UPDATE diary SET date='${date}', mood='${mood}', content='${content}', year='${year}', month='${month}', day='${day}', main_image='${main_image}' WHERE id='${diary_id}'`);
} catch (error) {
    console.log(error);
    return {error};
}
};

const deleteDiaryImages = async (diaryid) => {
  try {
    await query (`DELETE FROM diary_images WHERE diary_id = ${diaryid}`);
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
    await query (`DELETE FROM diary_data WHERE diary_id = ${diaryId} AND name='${name}'`);
} catch (error) {
    console.log(error);
    return {error};
}
};

const editDiaryData = async (diaryDataArray) => {
  try {
    for (let i in diaryDataArray) {
      let {diary_id, name, value, unit} = diaryDataArray[i]
      await query (`UPDATE diary_data SET name='${name}', value='${value}', unit='${unit}' WHERE diary_id='${diary_id}' AND name='${name}'`);
    }
    
} catch (error) {
    console.log(error);
    return {error};
}
};

const selectDiaryTime = async (progressId) => {
  try {
    let arr = await query (`SELECT year, month, day FROM diary WHERE progress_id =${progressId} ORDER BY date`);
    let output = {};
    for (let a of arr) {
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
    let diaryBasicInfo = await query(`SELECT progress_id, date, content, mood, main_image FROM diary WHERE id=${diaryid}`);
    diaryBasicInfo[0].fileName = diaryBasicInfo[0]['main_image'];
    diaryBasicInfo[0]['main_image'] = `${process.env.IMAGE_PATH}${diaryBasicInfo[0]['main_image']}`;
    let diaryInputData = await query(`SELECT name, value, unit FROM diary_data WHERE diary_id=${diaryid}`);
    let diaryImages = await query(`SELECT path FROM diary_images WHERE diary_id=${diaryid}`);
    for (let i in diaryImages){
      diaryImages[i].fileName = diaryImages[i].path;
      diaryImages[i].path = `${process.env.IMAGE_PATH}${diaryImages[i].path}`
    }
    let diaryData = {
      basicInfo: diaryBasicInfo[0],
      inputData: diaryInputData,
      images: diaryImages
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
      let moodData = await query (`SELECT SUM(mood)/COUNT(*), year FROM diary WHERE progress_id = ${progressid} AND NOT mood ='0' GROUP BY year`);
      let yearArray = [];
      let moodArray = [];
      for (let i in moodData) {
        yearArray.push(moodData[i].year);
        moodArray.push(moodData[i]['SUM(mood)/COUNT(*)'])
      }
      data = {
        Xs: yearArray,
        Ys: moodArray
      }
      return (data);
    } else if (month == "All") {
      let moodData = await query (`SELECT SUM(mood)/COUNT(*), month FROM diary WHERE progress_id = ${progressid} AND year = ${year} AND NOT mood ='0' GROUP BY month`)
      let monthArray = [];
      let moodArray = [];
      for (let i in moodData) {
        monthArray.push(`${moodData[i].month}月`);
        moodArray.push(moodData[i]['SUM(mood)/COUNT(*)'])
      }
      data = {
        Xs: monthArray,
        Ys: moodArray
      }
      return (data);
    } else {
      let moodData = await query (`SELECT mood, day FROM diary WHERE progress_id = ${progressid} AND year = ${year} AND month = ${month} AND NOT mood ='0' ORDER BY day`)
      let dayArray = [];
      let moodArray = [];
      for (let i in moodData) {
        dayArray.push(moodData[i].day);
        moodArray.push(moodData[i].mood);
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
      let result = await query (`SELECT SUM(diary_data.value)/count(*), diary.year FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND diary_data.name='${datatype}' GROUP BY year`)
      let yearArray = [];
      let valueArray = [];
      for (let i in result) {
        yearArray.push(result[i].year);
        valueArray.push(result[i]['SUM(diary_data.value)/count(*)'])
      }
      data = {
        Xs: yearArray,
        Ys: valueArray
      }
      return (data);
    } else if (month == "All") {
      let result = await query (`SELECT SUM(diary_data.value)/count(*), diary.month FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND year = ${year} AND diary_data.name='${datatype}' GROUP BY month`)
      let monthArray = [];
      let valueArray = [];
      for (let i in result) {
        monthArray.push(`${result[i].month}月`);
        valueArray.push(result[i]['SUM(diary_data.value)/count(*)'])
      }
      data = {
        Xs: monthArray,
        Ys: valueArray
      }
      return (data);
    } else {
      let result = await query (`SELECT SUM(diary_data.value)/count(*), diary.day FROM diary JOIN diary_data ON diary.id = diary_data.diary_id WHERE diary.progress_id=${progressid} AND year = ${year} AND month = ${month} AND diary_data.name='${datatype}' GROUP BY day`);
      let dayArray = [];
      let valueArray = [];
      for (let i in result) {
        dayArray.push(result[i].day);
        valueArray.push(result[i]['SUM(diary_data.value)/count(*)'])
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
      let result = await query (`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} ORDER BY date DESC LIMIT ${page},8`);
      for (let i in result) {
        result[i].main_image = `${process.env.IMAGE_PATH}${result[i].main_image}`
      }
      let allResults = await query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid}`);
      let allResultsLength = allResults.length;
      let allPages = Math.ceil(allResultsLength/8);
      data = {
        allPages,
        allResultsLength,
        diarys: result
      };
      return (data);
    } else if (month == "All") {
      let result = await query (`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} ORDER BY date DESC LIMIT ${page},8`);
      for (let i in result) {
        result[i].main_image = `${process.env.IMAGE_PATH}${result[i].main_image}`
      }
      let allResults = await query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year}`);
      let allResultsLength = allResults.length;
      let allPages = Math.ceil(allResultsLength/8);
      data = {
        allPages,
        allResultsLength,
        diarys: result
      }
      return (data);
    } else {
      let result = await query (`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} AND month = ${month} ORDER BY date DESC LIMIT ${page},8`);
      for (let i in result) {
        result[i].main_image = `${process.env.IMAGE_PATH}${result[i].main_image}`
      }
      let allResults = await query(`SELECT id, date, main_image, content FROM diary WHERE progress_id=${progressid} AND year = ${year} AND month = ${month}`);
      let allResultsLength = allResults.length;
      let allPages = Math.ceil(allResultsLength/8);
      data = {
        allPages,
        allResultsLength,
        diarys: result
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