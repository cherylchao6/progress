//basic setting
const express = require('express');
const app = express();
const path = require('path');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
// app.use('/', express.static('public'));
//美化json排版
app.set('json spaces', 2);

app.listen(4000, () => {
  console.log('the server is running on 4000');
});


//fakedata 
const { query } = require('./server/model/mysql');
function getRandom(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
};
app.post('/fakedata', async (req,res)=>{
  //diary table
  let sqlArray1 = [];
  for (let i=0; i<req.query.num; i++) {
    let year = getRandom(2020,2021);
    let mood = getRandom(0,7);
    let index = getRandom(0,5);
    let photoArray = ["cat1.jpeg", "cat2.jpeg", "cat4.jpeg", "cat5.jpeg", "cat6.jpeg", "cat7.jpeg"];
    let monthArray = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    let dayArray = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18','19','20','21','22','23','24','25','26','27','28','29','30']
    let index2 = getRandom(0,11);
    let index3 = getRandom(0,29);
    let photo = photoArray[index];
    let month = monthArray[index2];
    let day = dayArray[index3];
    let date = `${year}-${month}-${day}`;
    let diaryArray =[];
    diaryArray.push(1);
    diaryArray.push(date);
    diaryArray.push("iamsososocute");
    diaryArray.push(mood);
    diaryArray.push(photo);
    diaryArray.push(year);
    diaryArray.push(month);
    diaryArray.push(day);
    sqlArray1.push(diaryArray);
  }
  await query('INSERT INTO diary (progress_id, date, content, mood, main_image, year, month, day) VALUES ?', [sqlArray1]);
  //insert diaryData
  let sqlArray2 = [];
  for (let j=1; j < req.query.num/2 + 1; j++) {
    let value = getRandom(100,700);
    let dataArray = [];
    dataArray.push(j);
    dataArray.push('體重');
    dataArray.push(value);
    dataArray.push('kg');
    sqlArray2.push(dataArray);
  }
  for (let k=1; k < req.query.num/2 + 1; k++) {
    let value = getRandom(100,700);
    let dataArray = [];
    dataArray.push(k);
    dataArray.push('腰圍');
    dataArray.push(value);
    dataArray.push('cm');
    sqlArray2.push(dataArray);
  };

  for (let l=1; l < req.query.num/2 + 1; l++) {
    let value = getRandom(100,700);
    let dataArray = [];
    dataArray.push(req.query.num/2 + l);
    dataArray.push('體重');
    dataArray.push(value);
    dataArray.push('kg');
    sqlArray2.push(dataArray);
  }

  for (let m=1; m < req.query.num/2 + 1; m++) {
    let value = getRandom(100,700);
    let dataArray = [];
    dataArray.push(req.query.num/2 + m);
    dataArray.push('腰圍');
    dataArray.push(value);
    dataArray.push('cm');
    sqlArray2.push(dataArray);
  }

  await query('INSERT INTO diary_data (diary_id, name, value, unit) VALUES ?', [sqlArray2]);
  
  res.send("hihihi")
})
//Routes:
app.use(require('./server/routes/user'));
app.use(require('./server/routes/diary'));
app.use(require('./server/routes/progress'));

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(500).send(err);
});

app.use((req, res)=> {
res.sendStatus(404);
});
