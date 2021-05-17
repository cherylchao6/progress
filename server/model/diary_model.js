require('dotenv').config();
const { query } = require('./mysql');



addDiary = async (diaryData)=> {
  try {
    let result = await query('INSERT INTO diary SET ?', diaryData);
    let diaryId = result.insertId;
    return diaryId;
} catch (error) {
    console.log(error);
    return {error};
}
};

addDiaryData = async (diaryDataArray)=> {
  try {
    let sqlArray = [];
    for (let i in diaryDataArray) {
      let inputArray = [];
      inputArray.push(diaryDataArray[i]['diary_id']);
      inputArray.push(diaryDataArray[i]['name']);
      inputArray.push(parseInt(diaryDataArray[i]['value']));
      inputArray.push(diaryDataArray[i]['unit']);
      inputArray.push(parseInt(i)+1);
      sqlArray.push(inputArray);
    }
    await query('INSERT INTO diaryData (diary_id, name, value, unit, input_set) VALUES ?', [sqlArray]);
} catch (error) {
    console.log(error);
    return {error};
}
};

addDiaryImages = async (sqlArray)=> {
  try {
    await query('INSERT INTO diaryImages (diary_id, path) VALUES ?', [sqlArray]);
} catch (error) {
    console.log(error);
    return {error};
}
};

selectDiary = async (diaryid)=> {
  try {
    let diaryBasicInfo = await query(`SELECT progress_id, date, content, mood, main_image FROM diary WHERE id=${diaryid}`);
    diaryBasicInfo[0].fileName = diaryBasicInfo[0]['main_image'];
    diaryBasicInfo[0]['main_image'] = `${process.env.IMAGE_PATH}${diaryBasicInfo[0]['main_image']}`;
    let diaryInputData = await query(`SELECT name, value, unit, input_set FROM diaryData WHERE diary_id=${diaryid}`);
    let diaryImages = await query(`SELECT path FROM diaryImages WHERE diary_id=${diaryid}`);
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

editDiary = async (editDiaryData) => {
  try {
    let {date, mood, content, main_image, diary_id} = editDiaryData;
    let result = await query(`UPDATE diary SET date='${date}', mood='${mood}', content='${content}', main_image='${main_image}' WHERE id='${diary_id}'`);
} catch (error) {
    console.log(error);
    return {error};
}
};

deleteDiaryImages = async (diaryid) => {
  try {
    await query (`DELETE FROM diaryImages WHERE diary_id = ${diaryid}`);
} catch (error) {
    console.log(error);
    return {error};
}
};

editDiaryData = async (diaryDataArray) => {
  try {
    for (let i in diaryDataArray) {
      let inputSet = parseInt(i)+1
      console.log(inputSet);
      let {diary_id, name, value, unit} = diaryDataArray[i]
      await query (`UPDATE diaryData SET name='${name}', value='${value}', unit='${unit}' WHERE diary_id='${diary_id}' AND input_set='${inputSet}'`);
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
  deleteDiaryImages,
  editDiaryData
};