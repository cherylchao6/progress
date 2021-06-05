// Get API query parameter
let token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");

let data;
getProgressTimeData();
setTimeout(function(){sendDate()}, 1200);
getProgressData ();
getAuthorProfile();
let page = 0;
function addPage () {
  page += 1;
}

function minusPage () {
  if (0 <= page) {
    page -= 1;
  }
};

//socket
let myID;
let myName;
let myPic;
let myPicURL;
let noteBadge = document.querySelector('#noteBadge');
let msgBadge = document.querySelector('#msgBadge');

const socket = io({
  auth: {
  token
}
});

socket.on('connect', () => {
  console.log("connect to socket!!!");
});

socket.on("connect_error", (err) => {
  console.log(err.message);
  if (err.message) {
    alert(err.message);
    return window.location.assign('/signin');
  }
});

socket.on('userInfo', (userInfo)=>{
  console.log(userInfo);
  myID =  userInfo.id
  myName = userInfo.name;
  myPic = userInfo.photo;
  myPicURL = userInfo.photoURL;
  //localStorage只能存string
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
});

//看距離上次連線間有沒有未讀訊息(除了聊天室每頁都要有)
socket.on ("checknewMsgNotification", hasUnread => {
  console.log("checknewMsgNotification");
  if (hasUnread == "true") {
    msgBadge.style.display = 'block';
  }
});

//上線狀態但在看別頁的時候有人密我
socket.on(`newMsgNotification`, toWhom => {
  console.log("newMsg but I am not in room");
  if (toWhom == myID) {
    console.log("This msg is for me");
    msgBadge.style.display = 'block';
  }
});

//get progress time data
function getProgressTimeData () {
  fetch(`/api/1.0/progressTime?progressid=${progressId}`,{
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
    .then (timedata => {
      if (timedata) {
        console.log(timedata);
        if (Object.keys(timedata).length === 0) { 
          console.log("沒有日記");
          // let diaryMain = document.querySelector("#diaryMain");
          // diaryMain.display = "none";
          let noDiary = document.querySelector("#noDiary");
          noDiary.style.display = "flex";
          let chart = document.querySelector("#chart");
          chart.style.display = "none";
          let timescale = document.querySelector(".timescale");
          timescale.style.display = "none";
        };
        //appendColumns
        data = timedata;
        let column1 = document.querySelector("#column1");
        let column2 = document.querySelector("#column2");
        let yearArray = Object.keys(timedata);
        yearArray.unshift("All");
        let selectOptionsArray = yearArray.map(year => `<option value=${year} name=${year}>${year}</option>`);
        let recentYear = yearArray[yearArray.length-1];
        selectOptionsArray[selectOptionsArray.length-1]= `<option selected value=${recentYear} name=${recentYear}>${recentYear}</option>`;
        let options = selectOptionsArray.join('');
        column1.innerHTML = options;
        let monthArray = [];
        console.log(timedata[recentYear]);
        for (let k in timedata[recentYear]) {
          if (timedata[recentYear][k] !== null) {
            for (const key of Object.keys(timedata[recentYear][k])) {
              monthArray.push(key);
            }
          }
        }
        console.log(monthArray);
        monthArray.unshift("All");
        let selectOptionsMonthArray = monthArray.map(month => `<option value=${month} name=${month}>${month}</option>`);
        let recentMonth = monthArray[monthArray.length-1];
        selectOptionsMonthArray[selectOptionsMonthArray.length-1] = `<option selected value=${recentMonth} name=${recentMonth}>${recentMonth}</option>`;
        let monthOptions = selectOptionsMonthArray.join('');
        column2.innerHTML = monthOptions;
        } 
    });
};


//get Author profile 
function getAuthorProfile () {
  fetch(`/api/1.0/author/?progressid=${progressId}`,{
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
        console.log(data);
        if (data.shareRoomID) {
          let msgLink = document.querySelector('#msgLink');
          msgLink.href = `/chatroom.html?roomid=${data.shareRoomID}&user1id=${data.author}&user2id=${data.vistor}`;
        }
        let userName = document.querySelector('#userName');
        userName.innerHTML = data.name;
        let fans = document.querySelector('#fans');
        fans.innerHTML = `粉絲 ${data.follower}`;
        let idols = document.querySelector('#idols');
        idols.innerHTML = `偶像 ${data.following}`;
        let finishedProgress = document.querySelector('#finishedProgress');
        finishedProgress.innerHTML = data.finishedProgress;
        let motto = document.querySelector('#motto');
        motto.innerHTML = data.motto;
        let userPicture = document.querySelector('#userPicture');
        userPicture.src = data.photo;
        let editProfile = document.querySelector('#editProfile');
        let editProgress = document.querySelector('#editProgress');
        let editProgressLink = document.querySelector('#editProgressLink');
        let addDiary = document.querySelector('#addDiary');
        let addDiaryLink = document.querySelector('#addDiaryLink');
        let followBtn = document.querySelector("#followBtn");
        let msgBtn = document.querySelector('#MessageBtn');
        if (data.author == data.vistor) {
          editProfile.style.display = "flex";
          editProgress.style.display = "flex";
          addDiary.style.display = "flex";
          followBtn.style.display = "none";
          msgBtn.style.display = "none";
          //在這裡改連結
          editProgressLink.href=`/editProgress?progressid=${progressId}`;
          addDiaryLink.href=`/addDiary?progressid=${progressId}`;
        }
      }
    });
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
        console.log(data);
        //做gif
        if (data.diarys.length !== 0) { 
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
        let progressName = document.querySelector("#progressName");
        progressName.innerHTML = data.name;
        let category = document.querySelector("#category");
        category.innerHTML = `類別：${data.category}`;
        let motivation = document.querySelector("#motivation");
        motivation.innerHTML = data.motivation;
      }
    });
}



function onChangeColumn1() {
  let column2 = document.querySelector("#column2");
  let column1 = document.querySelector("#column1");
  let year = column1.options[column1.options.selectedIndex].text;
  if (year == "All") {
    column2.innerHTML = `<option selected value= "All" name= "All">All</option>`;
  }
  let monthArray = [];
  console.log(year);
  console.log(data);
    for (let k in data[year]) {
      for (const key of Object.keys(data[year][k])) {
        monthArray.push(key);
      }
    }
    monthArray.unshift("All");
    let selectOptionsMonthArray = monthArray.map(month => `<option value=${month} name=${month}>${month}</option>`);
    let recentMonth = monthArray[monthArray.length-1];
    if (year == "All") {
      console.log("here");
      selectOptionsMonthArray[0] = `<option selected value= "All" name= "All">All</option>`;
    }
    selectOptionsMonthArray[selectOptionsMonthArray.length-1] = `<option selected value=${recentMonth} name=${recentMonth}>${recentMonth}</option>`;
    let monthOptions = selectOptionsMonthArray.join('');
    column2.innerHTML = monthOptions;
};





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
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
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
      if (data.diarys.length == 0) {
        let chart = document.querySelector("#chart");
        chart.style.display = "none";
      }
      if (data.diarys.length !== 0) {
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
          let diaryLink = document.createElement("a");
          diaryLink.href = `/diary?progressid=${progressId}&diaryid=${data.diarys[i].id}`;
          diaryLink.style = "text-decoration:none;"
          diaryInfo.appendChild(diaryLink);
          let diaryInfoBorder = document.createElement("div");
          diaryInfoBorder.id = "diaryInfoBorder";
          diaryLink.appendChild(diaryInfoBorder);
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
      
    }
  })
}   

function signOut () {
  Swal.fire({
    title:"確定要登出嗎？",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#132235',
    cancelButtonColor: '#6ddad3',
    confirmButtonText: '確定',
    cancelButtonText:'取消'
  }).then(result=>{
    if (result.value) {
      Swal.fire(
        {
          title:"登出成功",
          icon:"success",
          confirmButtonColor: '#132235',
          confirmButtonText: 'OK',
        }
      );
      setTimeout(function(){ window.location.assign('/signin'); }, 4000);
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("userInfo");
      socket.emit("logOut", "true");
    }
  });
}

function editProfile() {
  Swal.fire({
    title: '上傳自己的帥照美照吧',
    width: '600px',
    showCancelButton: true,
    confirmButtonColor: '#132235',
    cancelButtonColor: '#6ddad3',
    confirmButtonText: '確定',
    cancelButtonText:'取消',
    html:
    `<form method='POST' enctype='multipart/form-data' name='uploadNewUserInfo' id="uploadNewUserInfo">`+
      `<input type="text" id="updatemotto" name="updatemotto" class="swal2-input" placeholder="請輸入座右銘">`+
      `<input type="file" id="uploaduserPic" name="picture" class="swal2-input" accept="image/*">`+
    `</form>`,
  }).then (result =>{
    if (result.value) {
      let form = document.forms.namedItem("uploadNewUserInfo");
      let data = new FormData(form);
      fetch('/updateUserProfile', {
        method: 'POST',
        body: data,
        headers: { 'authorization': `Bearer ${token}` },
      })
      .then(response =>{
        if (response.status === 200) {
          return response.json();
        } 
      })
      .then(data =>{
        if(data) {
          let motto = document.querySelector('#motto');
          motto.innerHTML = data.motto;
          let userPicture = document.querySelector('#userPicture');
          userPicture.src = data.photo;
        }
      });
    }
  });
}

