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
 
    // for (let k in yearArray) {
    //   let allMonthArray = await query (`SELECT DISTINCT month FROM diary WHERE progress_id =${progressId} AND year=${yearArray[k]} ORDER BY month`);
    //   let monthDayArray = [];
    //   for (let l in allMonthArray) {
    //     let allDay = await query (`SELECT day FROM diary WHERE progress_id =${progressId} AND year=${yearArray[k]} AND month=${allMonthArray[l].month} ORDER BY day`);
    //     let allDayArray = [];
    //     for (let p in allDay) {
    //       allDayArray.push(allDay[p].day);
    //     }
    //     let month = allMonthArray[l].month;
    //     let monthDay = {};//{月：[日array]}
    //     monthDay[month] = allDayArray;
    //     monthDayArray.push(monthDay);
    //   }
    //   let year = yearArray[k];
    //   data[year]= monthDayArray;
    // }  
    return(output);
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
  deleteDiaryImages,
  deleteDiaryData,
  editDiaryData,
  deleteDiaryDataNotInProgress,
  selectDiaryTime
};