// Get API query parameter
let token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");
let data;
renderSelectTimeData();
setTimeout(function(){appendColumns()}, 1500);
setTimeout(function(){sendDate()}, 1700);
getProgressData ();
let page = 0;
function addPage () {
  page += 1;
}

function minusPage () {
  if (0 <= page) {
    page -= 1;
  }
};
//get progress time data
async function getProgressTimeData () {
  return await fetch(`/api/1.0/progressTime?progressid=${progressId}`,{
    method: "GET",
    headers: { 'authorization': `Bearer ${token}` },
  }).then(response => {
    if (response.status === 200 ) {
      return response.json();
    } else if (response.status === 401) {
      alert('請先登入');
      return window.location.assign('/signin');
      } else if (response.status === 403) {
        alert('無權限操做此網頁');
        return window.location.assign('/signin');
      }
    })
    .then (data => {
      if (data) {
        let column1 = document.querySelector("#column1");
        let column2 = document.querySelector("#column2");
        let yearArray = Object.keys(data);
        yearArray.unshift("All");
        let selectOptionsArray = yearArray.map(year => `<option value=${year} name=${year}>${year}</option>`);
        let recentYear = yearArray[yearArray.length-1];
        selectOptionsArray[selectOptionsArray.length-1]= `<option selected value=${recentYear} name=${recentYear}>${recentYear}</option>`;
        let options = selectOptionsArray.join('');
        // let select_options = yearArray.map(year => `<option value=${year} name=${year}>${year}</option>`).join('');
        // let selects = `<option selected value="0" name="year">年</option>${select_options}`
        column1.innerHTML = options;
        let monthArray = [];
        for (let k in data[recentYear]) {
          for (const key of Object.keys(data[recentYear][k])) {
            monthArray.push(key);
          }
        }
        monthArray.unshift("All");
        let selectOptionsMonthArray = monthArray.map(month => `<option value=${month} name=${month}>${month}</option>`);
        let recentMonth = monthArray[monthArray.length-1];
        selectOptionsMonthArray[selectOptionsMonthArray.length-1] = `<option selected value=${recentMonth} name=${recentMonth}>${recentMonth}</option>`;
        let monthOptions = selectOptionsMonthArray.join('');
        column2.innerHTML = monthOptions;
        } 
    });
};

async function renderSelectTimeData () {
  data = await getProgressTimeData ();
}


//get progress data
function getProgressData () {
  fetch(`/api/1.0/progress/diarys?progressid=${progressId}`,{
    method: "GET",
    headers: { 'authorization': `Bearer ${token}` },
  }).then(response => {
    if (response.status === 200 ) {
      return response.json();
    } else if (response.status === 401) {
      alert('請先登入');
      return window.location.assign('/signin');
      } else if (response.status === 403) {
        alert('無權限操做此網頁');
        return window.location.assign('/signin');
      }
    })
    .then (data => {
      if (data) {
        //sql資料填入input
        console.log(data);
        //做gif
        let images = [];
        for (let i in data.diarys) {
          let image = {
            src: data.diarys[i].main_image
          }
          images.push(image);
        }
        gifshot.createGIF({
          'images': images,
          'interval': 1,
        },function(obj) {
        if(!obj.error) {
          var src = obj.image;
          let diaryPicture = document.querySelector('#diaryPicture');
          diaryPicture.src = src;
        }
        });
        //append datatype column 
        let column3 = document.querySelector("#column3");

        let dataArray = ['心情'];
        for (let i in data.datatype) {
          dataArray.push(data.datatype[i].name);
        }
        let selectOptionsdataArray = dataArray.map(data => `<option value=${data} name=${data}>${data}</option>`);
        selectOptionsdataArray[0] = `<option selected value='心情' name='心情'>心情</option>`;
        let moodOptions = selectOptionsdataArray.join('');
        column3.innerHTML = moodOptions;
        let progressName = document.querySelector("#progressName");
        progressName.innerHTML = data.name;
        let category = document.querySelector("#category");
        category.innerHTML = `類別：${data.category}`;
        let motivation = document.querySelector("#motivation");
        motivation.innerHTML = data.motivation;
        let diaryDay = document.querySelector("#diaryDay");
        let firstDate = data.diarys[0].date;
        let lastDate = data.diarys[data.diarys.length-1].date;
        //計算progress總天數
        let progressDays = function (firstDate, lastDate) { 
          let date, date1, date2, days;
          date = firstDate.split("/")
          date1 = new Date(date[1] + '/' + date[2] + '/' + date[0]); // 轉換為 06/18/2016 格式
          date = lastDate.split("/")
          date2 = new Date(date[1] + '/' + date[2] + '/' + date[0]);
          days = parseInt(Math.abs(date1 - date2) / 1000 / 60 / 60 / 24); // 把相差的毫秒數轉換為天數
          return days;
        };
        let totalDays = progressDays(firstDate, lastDate);
        diaryDay.innerHTML = `${totalDays}</br>Days`;
        

      }
    });
}



function onChangeColumn1() {
  let column2 = document.querySelector("#column2");
  let column1 = document.querySelector("#column1");
  let year = column1.options[column1.options.selectedIndex].text;
  let monthArray = [];
  for (let k in data[year]) {
    for (const key of Object.keys(data[year][k])) {
      monthArray.push(key);
    }
  }
  monthArray.unshift("All");
  let selectOptionsMonthArray = monthArray.map(month => `<option value=${month} name=${month}>${month}</option>`);
  let recentMonth = monthArray[monthArray.length-1];
  selectOptionsMonthArray[selectOptionsMonthArray.length-1] = `<option selected value=${recentMonth} name=${recentMonth}>${recentMonth}</option>`;
  let monthOptions = selectOptionsMonthArray.join('');
  column2.innerHTML = monthOptions;
};




function appendColumns() {
  let column1 = document.querySelector("#column1");
  let column2 = document.querySelector("#column2");
  let yearArray = Object.keys(data);
  yearArray.unshift("All");
  let selectOptionsArray = yearArray.map(year => `<option value=${year} name=${year}>${year}</option>`);
  let recentYear = yearArray[yearArray.length-1];
  selectOptionsArray[selectOptionsArray.length-1]= `<option selected value=${recentYear} name=${recentYear}>${recentYear}</option>`;
  let options = selectOptionsArray.join('');
  // let select_options = yearArray.map(year => `<option value=${year} name=${year}>${year}</option>`).join('');
  // let selects = `<option selected value="0" name="year">年</option>${select_options}`
  column1.innerHTML = options;
  let monthArray = [];
  for (let k in data[recentYear]) {
    for (const key of Object.keys(data[recentYear][k])) {
      monthArray.push(key);
    }
  }
  monthArray.unshift("All");
  let selectOptionsMonthArray = monthArray.map(month => `<option value=${month} name=${month}>${month}</option>`);
  let recentMonth = monthArray[monthArray.length-1];
  selectOptionsMonthArray[selectOptionsMonthArray.length-1] = `<option selected value=${recentMonth} name=${recentMonth}>${recentMonth}</option>`;
  let monthOptions = selectOptionsMonthArray.join('');
  column2.innerHTML = monthOptions;
}
//draw canvas
let ctx = document.getElementById('chart').getContext('2d');
let myChart = new Chart(ctx, {
  type: 'line',
  data: {
      labels: [],
      datasets: [{
          label: 'weight',
          data: [],
          backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
      }]
  },
  options: {
      scales: {
          y: {
              ticks: {
                // forces step size to be 50 units
                stepSize: 50
              }
          }
      },
      plugins: {
        legend: {
          display: false
        }
      }
  }
});

//Submit form 
function clearPage () {
 page=0;
}
function sendDate () {
  myChart.destroy();
  let year = document.querySelector('#column1').value;
  let month = document.querySelector('#column2').value;
  let datatype = document.querySelector('#column3').value;
  let data = {
    year,
    month,
    datatype
  }
  fetch(`/progressChart?progressid=${progressId}&paging=${page}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
  .then(function (response) {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign('/signin.html');
    } else if (response.status === 403) {
      alert("登入逾期，請重新登入");
      return window.location.assign('/signin.html');
    }
  })
  .then(data => {
    if (data) {
      console.log(data);
      myChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: data.Xs,
              datasets: [{
                  data: data.Ys,
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)'
                  ],
                  borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)'
                  ],
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  y: {
                      ticks: {
                        // forces step size to be 50 units
                        stepSize: 50
                      }
                  }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
          },
      });
      // ------圖表分隔線------------------------------------
      let nextBtn = document.querySelector("#nextBtn");
      let previousBtn = document.querySelector("#previousBtn");
      if (data.next_paging == 1) {
        previousBtn.style.display = "none";
        nextBtn.style.display = "inline";
      } else if (!data.next_paging) {
        previousBtn.style.display = "inline";
        nextBtn.style.display = "none";
      } else {
        nextBtn.style.display = "inline";
        previousBtn.style.display = "inline";
      }
      // -------顯示日記--------------
      let diarys = document.querySelector("#diarys");
      diarys.innerHTML="";
      for (let i in data.diarys) {
        let diaryInfo = document.createElement("div");
        diaryInfo.className = "col-3 diaryInfo";
        diaryInfo.dataset.bsToggle = "tooltip";
        diaryInfo.dataset.bsPlacement = "bottom";
        diaryInfo.title = `${data.diarys[i].content}`;
        diarys.appendChild(diaryInfo);
        let diaryInfoBorder = document.createElement("div");
        diaryInfoBorder.id = "diaryInfoBorder";
        diaryInfo.appendChild(diaryInfoBorder);
        let date = document.createElement("div");
        date.className = "text-center";
        date.id = "date";
        let dateTitle = document.createElement("p");
        dateTitle.id = "dateFont";
        dateTitle.innerHTML = `${data.diarys[i].date}`;
        date.appendChild(dateTitle);
        diaryInfoBorder.appendChild(date);
        let imgDiv = document.createElement("div");
        let img = document.createElement("img");
        img.className = "diaryImage";
        img.src =`${data.diarys[i].main_image}`
        imgDiv.appendChild(img);
        diaryInfoBorder.appendChild(imgDiv);
      }
    }
  })
}   


