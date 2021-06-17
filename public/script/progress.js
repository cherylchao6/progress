// Get API query parameter

const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");
getProgressTimeData();
setTimeout(function () { sendDate(); }, 1200);
getProgressData();
getAuthorProfile();
let authorID;
let data;

let page = 0;
function addPage () {
  page += 1;
}

function minusPage () {
  if (page >= 0) {
    page -= 1;
  }
};

// socket
let myID;
let myName;
let myPic;
let myPicURL;
const noteBadge = document.querySelector("#noteBadge");
const msgBadge = document.querySelector("#msgBadge");

const socket = io({
  auth: {
    token
  }
});

socket.on("connect", () => {
  console.log("connect to socket!!!");
});

socket.on("connect_error", (err) => {
  console.log(err.message);
  if (err.message) {
    alert(err.message);
    return window.location.assign("/signin");
  }
});

socket.on("userInfo", (userInfo) => {
  console.log(userInfo);
  myID = userInfo.id;
  myName = userInfo.name;
  myPic = userInfo.photo;
  myPicURL = userInfo.photoURL;
  // localStorage只能存string
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
  const myprogress = document.querySelector("#myprogress");
  myprogress.href = `myProgress?userid=${myID}`;
});

// 看距離上次連線間有沒有未讀訊息(除了聊天室每頁都要有)
socket.on("checknewMsgNotification", hasUnread => {
  console.log("checknewMsgNotification");
  if (hasUnread == "true") {
    msgBadge.style.display = "block";
  }
});

// 上線狀態但在看別頁的時候有人密我
socket.on("newMsgNotification", toWhom => {
  console.log("newMsg but I am not in room");
  if (toWhom == myID) {
    console.log("This msg is for me");
    msgBadge.style.display = "block";
  }
});

// get progress time data
function getProgressTimeData () {
  fetch(`/api/1.0/progressTime?progressid=${progressId}`, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` }
  }).then(response => {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign("/signin");
    } else if (response.status === 403) {
      alert("無權限操做此網頁");
      return window.location.assign("/signin");
    }
  })
    .then(timedata => {
      if (timedata) {
        data = timedata;
        console.log(timedata);
        if (Object.keys(timedata).length === 0) {
          console.log("沒有日記");
          // let diaryMain = document.querySelector("#diaryMain");
          // diaryMain.display = "none";
          const noDiary = document.querySelector("#noDiary");
          noDiary.style.display = "flex";
          const chart = document.querySelector("#chart");
          chart.style.display = "none";
          const timescale = document.querySelector(".timescale");
          timescale.style.display = "none";
          const diaryPicture = document.querySelector("#diaryPicture");
          diaryPicture.src = "https://i.imgur.com/3VYrII5.jpg";
          const diaryDay = document.querySelector("#diaryDay");
          diaryDay.innerHTML = "尚未開始";
        };
        // appendColumns
        const column1 = document.querySelector("#column1");
        const column2 = document.querySelector("#column2");
        const yearArray = Object.keys(timedata);
        yearArray.unshift("All");
        const selectOptionsArray = yearArray.map(year => `<option value=${year} name=${year}>${year}</option>`);
        const recentYear = yearArray[yearArray.length - 1];
        selectOptionsArray[selectOptionsArray.length - 1] = `<option selected value=${recentYear} name=${recentYear}>${recentYear}</option>`;
        const options = selectOptionsArray.join("");
        column1.innerHTML = options;
        const monthArray = [];
        console.log(timedata[recentYear]);
        for (const k in timedata[recentYear]) {
          if (timedata[recentYear][k] !== null) {
            for (const key of Object.keys(timedata[recentYear][k])) {
              monthArray.push(key);
            }
          }
        }
        console.log(monthArray);
        monthArray.unshift("All");
        const selectOptionsMonthArray = monthArray.map(month => `<option value=${month} name=${month}>${month}</option>`);
        const recentMonth = monthArray[monthArray.length - 1];
        selectOptionsMonthArray[selectOptionsMonthArray.length - 1] = `<option selected value=${recentMonth} name=${recentMonth}>${recentMonth}</option>`;
        const monthOptions = selectOptionsMonthArray.join("");
        column2.innerHTML = monthOptions;
      }
    });
};

// get Author profile
function getAuthorProfile () {
  fetch(`/api/1.0/author/?progressid=${progressId}`, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` }
  }).then(response => {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign("/signin");
    } else if (response.status === 403) {
      alert("無權限操做此網頁");
      return window.location.assign("/signin");
    }
  })
    .then(data => {
      if (data) {
        console.log(data);
        authorID = data.author;
        if (data.shareRoomID) {
          const msgLink = document.querySelector("#msgLink");
          msgLink.href = `/chatroom.html?roomid=${data.shareRoomID}&user1id=${data.author}&user2id=${data.vistor}`;
        }
        const userLink = document.querySelector("#userLink");
        userLink.href = `/myProgress?userid=${data.author}`;
        const userName = document.querySelector("#userName");
        userName.innerHTML = data.name;
        const fans = document.querySelector("#fans");
        fans.innerHTML = `粉絲 ${data.follower.length}`;
        const idols = document.querySelector("#idols");
        idols.innerHTML = `偶像 ${data.following.length}`;
        const motto = document.querySelector("#motto");
        motto.innerHTML = data.motto;
        const userPicture = document.querySelector("#userPicture");
        userPicture.src = data.photo;
        const editProfile = document.querySelector("#editProfile");
        const editProgress = document.querySelector("#editProgress");
        const editProgressLink = document.querySelector("#editProgressLink");
        const addDiary = document.querySelector("#addDiary");
        const addDiaryLink = document.querySelector("#addDiaryLink");
        const finishProgress = document.querySelector("#finishProgress");
        const unfinishProgress = document.querySelector("#unfinishProgress");
        const unfinishProgressCol = document.querySelector("#unfinishProgressCol");
        const followBtn = document.querySelector("#followBtn");
        const msgBtn = document.querySelector("#MessageBtn");
        if (data.author == data.vistor && data.status == 1) {
          console.log(unfinishProgressCol);
          unfinishProgressCol.style.display = "flex";
        } else if (data.author == data.vistor && data.status == 0) {
          finishProgress.style.display = "flex";
          addDiary.style.display = "flex";
        }
        if (data.author == data.vistor) {
          editProfile.style.display = "flex";
          editProgress.style.display = "flex";
          followBtn.style.display = "none";
          msgBtn.style.display = "none";
          // 在這裡改連結
          editProgressLink.href = `/editProgress?progressid=${progressId}`;
          addDiaryLink.href = `/addDiary?progressid=${progressId}`;
        }
      }
      // 粉絲偶像modal
      const fansList = document.querySelector("#fansList");
      const idolList = document.querySelector("#idolList");
      myID = JSON.parse(localStorage.getItem("userInfo")).id;
      for (const i in data.follower) {
        if (data.follower[i].follower_id == myID) {
          const followBtn = document.querySelector("#followBtn");
          followBtn.innerHTML = "退追";
        }
        const listRow = document.createElement("div");
        listRow.className = "row listRow";
        fansList.appendChild(listRow);
        const listImgDiv = document.createElement("div");
        listImgDiv.className = "col-3 listImgDiv";
        listRow.appendChild(listImgDiv);
        const imgLink = document.createElement("a");
        imgLink.href = `/myProgress?userid=${data.follower[i].follower_id}`;
        listImgDiv.appendChild(imgLink);
        const listImg = document.createElement("img");
        listImg.className = "listImg";
        listImg.src = data.follower[i].photo;
        imgLink.appendChild(listImg);
        const listNameDiv = document.createElement("listNameDiv");
        listNameDiv.className = "col-3 listNameDiv";
        listRow.appendChild(listNameDiv);
        const listName = document.createElement("p");
        listName.className = "listName";
        listName.innerHTML = data.follower[i].name;
        listNameDiv.appendChild(listName);
      }
      for (const i in data.following) {
        const listRow = document.createElement("div");
        listRow.className = "row listRow";
        idolList.appendChild(listRow);
        const listImgDiv = document.createElement("div");
        listImgDiv.className = "col-3 listImgDiv";
        listRow.appendChild(listImgDiv);
        const imgLink = document.createElement("a");
        imgLink.href = `/myProgress?userid=${data.following[i].following_id}`;
        listImgDiv.appendChild(imgLink);
        const listImg = document.createElement("img");
        listImg.className = "listImg";
        listImg.src = data.following[i].photo;
        imgLink.appendChild(listImg);
        const listNameDiv = document.createElement("listNameDiv");
        listNameDiv.className = "col-3 listNameDiv";
        listRow.appendChild(listNameDiv);
        const listName = document.createElement("p");
        listName.className = "listName";
        listName.innerHTML = data.following[i].name;
        listNameDiv.appendChild(listName);
      }
    });
}

// get progress data
function getProgressData () {
  fetch(`/api/1.0/progress/diarys?progressid=${progressId}`, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` }
  }).then(response => {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign("/signin");
    } else if (response.status === 403) {
      alert("無權限操做此網頁");
      return window.location.assign("/signin");
    }
  })
    .then(data => {
      if (data) {
        console.log(data);
        // 做gif
        const status = document.querySelector("#status");
        if (data.status == 1) {
          status.innerHTML = "狀態：已完成";
        } else {
          status.innerHTML = "狀態：未完成";
        }
        if (data.diarys.length !== 0) {
          const images = [];
          for (const i in data.diarys) {
            // const image = {
            //   src: data.diarys[i].main_image
            // };
            images.push(data.diarys[i].main_image);
          }
          gifshot.createGIF({
            images: images,
            interval: 1
          }, function (obj) {
            if (!obj.error) {
              const src = obj.image;
              const diaryPicture = document.querySelector("#diaryPicture");
              diaryPicture.src = src;
            }
          });
          // append datatype column
          const column3 = document.querySelector("#column3");

          const dataArray = ["心情"];
          for (const i in data.datatype) {
            dataArray.push(data.datatype[i].name);
          }
          const selectOptionsdataArray = dataArray.map(data => `<option value=${data} name=${data}>${data}</option>`);
          selectOptionsdataArray[0] = "<option selected value='心情' name='心情'>心情</option>";
          const moodOptions = selectOptionsdataArray.join("");
          column3.innerHTML = moodOptions;
          const diaryDay = document.querySelector("#diaryDay");
          const firstDate = data.diarys[0].date;
          const lastDate = data.diarys[data.diarys.length - 1].date;
          // 計算progress總天數
          const progressDays = function (firstDate, lastDate) {
            let date, date1, date2, days;
            date = firstDate.split("/");
            date1 = new Date(date[1] + "/" + date[2] + "/" + date[0]); // 轉換為 06/18/2016 格式
            date = lastDate.split("/");
            date2 = new Date(date[1] + "/" + date[2] + "/" + date[0]);
            days = parseInt(Math.abs(date1 - date2) / 1000 / 60 / 60 / 24); // 把相差的毫秒數轉換為天數
            return days;
          };
          const totalDays = progressDays(firstDate, lastDate);
          diaryDay.innerHTML = `${totalDays}</br>Days`;
        }
        const progressName = document.querySelector("#progressName");
        progressName.innerHTML = data.name;
        const category = document.querySelector("#category");
        category.innerHTML = `類別：${data.category}`;
        const motivation = document.querySelector("#motivation");
        motivation.innerHTML = data.motivation;
        if (data.diarys.length == 1) {
          const oneDiary = document.querySelector("#oneDiary");
          oneDiary.style.display = "block";
          console.log("one diary");
        }
      }
    });
}

function onChangeColumn1 () {
  const column2 = document.querySelector("#column2");
  const column1 = document.querySelector("#column1");
  const year = column1.options[column1.options.selectedIndex].text;
  if (year == "All") {
    column2.innerHTML = "<option selected value= \"All\" name= \"All\">All</option>";
  }
  const monthArray = [];
  console.log(year);
  console.log(data);
  for (const k in data[year]) {
    for (const key of Object.keys(data[year][k])) {
      monthArray.push(key);
    }
  }
  monthArray.unshift("All");
  const selectOptionsMonthArray = monthArray.map(month => `<option value=${month} name=${month}>${month}</option>`);
  const recentMonth = monthArray[monthArray.length - 1];
  if (year == "All") {
    console.log("here");
    selectOptionsMonthArray[0] = "<option selected value= \"All\" name= \"All\">All</option>";
  }
  selectOptionsMonthArray[selectOptionsMonthArray.length - 1] = `<option selected value=${recentMonth} name=${recentMonth}>${recentMonth}</option>`;
  const monthOptions = selectOptionsMonthArray.join("");
  column2.innerHTML = monthOptions;
};

// draw canvas
const ctx = document.getElementById("chart").getContext("2d");
let myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "weight",
      data: [],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)"
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)"
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

// Submit form
function clearPage () {
  page = 0;
}
function sendDate () {
  myChart.destroy();
  const year = document.querySelector("#column1").value;
  const month = document.querySelector("#column2").value;
  const datatype = document.querySelector("#column3").value;
  const data = {
    year,
    month,
    datatype
  };
  fetch(`/progressChart?progressid=${progressId}&paging=${page}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    })
  })
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 401) {
        alert("請先登入");
        return window.location.assign("/signin.html");
      } else if (response.status === 403) {
        alert("登入逾期，請重新登入");
        return window.location.assign("/signin.html");
      }
    })
    .then(data => {
      if (data) {
        console.log(data);
        if (data.diarys.length == 0) {
          const chart = document.querySelector("#chart");
          chart.style.display = "none";
        }
        if (data.diarys.length !== 0) {
          myChart = new Chart(ctx, {
            type: "line",
            data: {
              labels: data.Xs,
              datasets: [{
                data: data.Ys,
                backgroundColor: [
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(153, 102, 255, 0.2)",
                  "rgba(255, 159, 64, 0.2)"
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                  "rgba(153, 102, 255, 1)",
                  "rgba(255, 159, 64, 1)"
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
          // ------圖表分隔線------------------------------------
          const nextBtn = document.querySelector("#nextBtn");
          const previousBtn = document.querySelector("#previousBtn");
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
          const diarys = document.querySelector("#diarys");
          diarys.innerHTML = "";
          for (const i in data.diarys) {
            const diaryInfo = document.createElement("div");
            diaryInfo.className = "col-3 diaryInfo";
            diaryInfo.dataset.bsToggle = "tooltip";
            diaryInfo.dataset.bsPlacement = "bottom";
            diaryInfo.title = `${data.diarys[i].content}`;
            diarys.appendChild(diaryInfo);
            const diaryLink = document.createElement("a");
            diaryLink.href = `/diary?progressid=${progressId}&diaryid=${data.diarys[i].id}`;
            diaryLink.style = "text-decoration:none;";
            diaryInfo.appendChild(diaryLink);
            const diaryInfoBorder = document.createElement("div");
            diaryInfoBorder.id = "diaryInfoBorder";
            diaryLink.appendChild(diaryInfoBorder);
            const date = document.createElement("div");
            date.className = "text-center";
            date.id = "date";
            const dateTitle = document.createElement("p");
            dateTitle.id = "dateFont";
            dateTitle.innerHTML = `${data.diarys[i].date}`;
            date.appendChild(dateTitle);
            diaryInfoBorder.appendChild(date);
            const imgDiv = document.createElement("div");
            const img = document.createElement("img");
            img.className = "diaryImage";
            img.src = `${data.diarys[i].main_image}`;
            imgDiv.appendChild(img);
            diaryInfoBorder.appendChild(imgDiv);
          }
        }
      }
    });
}

function signOut () {
  Swal.fire({
    title: "確定要登出嗎？",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#132235",
    cancelButtonColor: "#6ddad3",
    confirmButtonText: "確定",
    cancelButtonText: "取消"
  }).then(result => {
    if (result.value) {
      Swal.fire(
        {
          title: "登出成功",
          icon: "success",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
      setTimeout(function () { window.location.assign("/signin"); }, 4000);
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("userInfo");
      socket.emit("logOut", "true");
    }
  });
}

function editProfile () {
  Swal.fire({
    title: "上傳自己的帥照美照吧",
    width: "600px",
    showCancelButton: true,
    confirmButtonColor: "#132235",
    cancelButtonColor: "#6ddad3",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    html:
    "<form method='POST' enctype='multipart/form-data' name='uploadNewUserInfo' id=\"uploadNewUserInfo\">" +
      "<input type=\"text\" id=\"updatemotto\" name=\"updatemotto\" class=\"swal2-input\" placeholder=\"請輸入座右銘\">" +
      "<input type=\"file\" id=\"uploaduserPic\" name=\"picture\" class=\"swal2-input\" accept=\"image/*\">" +
    "</form>"
  }).then((result) => {
    if (result.value) {
      const form = document.forms.namedItem("uploadNewUserInfo");
      const data = new FormData(form);
      fetch("/updateUserProfile", {
        method: "POST",
        body: data,
        headers: { authorization: `Bearer ${token}` }
      })
        .then(async (response) => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 500) {
            const msg = await response.json();
            if (msg.error.message == "File too large") {
              Swal.fire(
                {
                  title: "檔案請勿超過1MB",
                  text: "請重新上傳一張小一點點的喔",
                  icon: "error",
                  confirmButtonColor: "#132235",
                  confirmButtonText: "OK"
                }
              );
            } else {
              Swal.fire(
                {
                  title: "伺服器維修中",
                  text: "真的很抱歉喔～請稍後再使用",
                  icon: "error",
                  confirmButtonColor: "#132235",
                  confirmButtonText: "OK"
                }
              );
            }
          }
        })
        .then(data => {
          if (data) {
            const motto = document.querySelector("#motto");
            motto.innerHTML = data.motto;
            const userPicture = document.querySelector("#userPicture");
            userPicture.src = data.photo;
          }
        });
    }
  });
}

const searchInput = document.querySelector("#search");
searchInput.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    search();
  }
});
function search () {
  const keyword = document.querySelector("#search").value;
  if (keyword !== "") {
    window.location.assign(`/category.html?keyword=${keyword}`);
  }
}

function finishProgress () {
  fetch(`/finishProgress?status=1&progressid=${progressId}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    }
  }).then(response => {
    if (response.status === 200) {
      Swal.fire(
        {
          title: "恭喜您完成Progress!!!!",
          icon: "success",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      ).then(() => {
        window.location.assign(`/progress?progressid=${progressId}`);
      });
      return response.json();
    } else if (response.status === 401) {
      Swal.fire(
        {
          title: "請先登入",
          icon: "warning",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    } else if (response.status === 403) {
      Swal.fire(
        {
          title: "登入逾期",
          icon: "error",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    } else if (response.status === 405) {
      Swal.fire(
        {
          title: "無權限操作",
          icon: "error",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    }
  });
}

function unfinishProgress () {
  fetch(`/finishProgress?status=0&progressid=${progressId}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    }
  }).then(response => {
    if (response.status === 200) {
      Swal.fire(
        {
          title: "很好！很有鬥志！繼續努力",
          icon: "success",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      ).then(() => {
        window.location.assign(`/progress?progressid=${progressId}`);
      });
      return response.json();
    } else if (response.status === 401) {
      Swal.fire(
        {
          title: "請先登入",
          icon: "warning",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    } else if (response.status === 403) {
      Swal.fire(
        {
          title: "登入逾期",
          icon: "error",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    } else if (response.status === 405) {
      Swal.fire(
        {
          title: "無權限操作",
          icon: "error",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    }
  });
}

function follow () {
  const data = {
    fans: myID,
    idol: authorID
  };
  fetch("/follow", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    }
  }).then(async (response) => {
    if (response.status === 200) {
      const msg = await response.json();
      Swal.fire(
        {
          title: msg.followStatus,
          icon: "success",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      ).then(() => {
        window.location.assign(`/progress?progressid=${progressId}`);
      });
      return response.json();
    } else if (response.status === 401) {
      Swal.fire(
        {
          title: "請先登入",
          icon: "warning",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    } else if (response.status === 403) {
      Swal.fire(
        {
          title: "登入逾期",
          icon: "error",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    }
  });
}
