// Get API query parameter
const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");
const diaryId = urlParams.get("diaryid");
const progressLink = document.querySelector("#progressLink");
progressLink.href = `/progress?progressid=${progressId}`;
getDiary();
getAuthorProfile();
// socket
let myID;
let myName;
let myPic;
let myPicURL;
const noteBadge = document.querySelector("#noteBadge");
const msgBadge = document.querySelector("#msgBadge");
let authorID;

const socket = io({
  auth: {
    token
  }
});

socket.on("connect", () => {
  console.log("connect to socket!!!");
});

socket.on("connect_error", (err) => {
  if (err.message) {
    alert(err.message);
    return window.location.assign("/signin");
  }
});

socket.on("userInfo", (userInfo) => {
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
  if (hasUnread == "true") {
    msgBadge.style.display = "block";
  }
});
// 上線狀態但在看別頁的時候有人密我
socket.on("newMsgNotification", toWhom => {
  if (toWhom == myID) {
    msgBadge.style.display = "block";
  }
});

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
        // 看是不是本人
        authorID = data.author;
        if (data.shareRoomID) {
          const msgLink = document.querySelector("#msgLink");
          msgLink.href = `/chatroom.html?roomid=${data.shareRoomID}&user1id=${data.author}&user2id=${data.vistor}`;
        }
        const editProfile = document.querySelector("#editProfile");
        const editDiary = document.querySelector("#editDiary");
        const editDiaryLink = document.querySelector("#editDiaryLink");
        const followBtn = document.querySelector("#followBtn");
        const msgBtn = document.querySelector("#MessageBtn");
        if (data.author == data.vistor) {
          editProfile.style.display = "flex";
          editDiary.style.display = "block";
          followBtn.style.display = "none";
          msgBtn.style.display = "none";
          // 在這裡改連結
          editDiaryLink.href = `/editDiary?progressid=${progressId}&diaryid=${diaryId}`;
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

// get Author profile
function getDiary () {
  fetch(`/api/1.0/diary/?progressid=${progressId}&diaryid=${diaryId}`, {
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
        const progressName = document.querySelector("#progressName");
        progressName.innerHTML = data.progressInfo.name;
        const category = document.querySelector("#category");
        category.innerHTML = `類別：${data.progressInfo.category}`;
        const motivation = document.querySelector("#motivation");
        motivation.innerHTML = data.progressInfo.motivation;
        const diaryPicture = document.querySelector("#diaryPicture");
        diaryPicture.src = `${data.data.basicInfo.main_image}`;
        const diaryDate = document.querySelector("#diaryDate");
        diaryDate.innerHTML = `${data.data.basicInfo.date}`;
        const firstDate = data.progressInfo.firstDiaryDate;
        const lastDate = data.data.basicInfo.date;
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
        const diaryDay = document.querySelector("#diaryDay");
        diaryDay.innerHTML = `${totalDays}</br>Days`;
        const mood = document.querySelector("#mood");
        switch (data.data.basicInfo.mood) {
        case "0":
          mood.innerHTML = "";
          break;
        case "1":
          mood.innerHTML = "心情：&#129326 我是誰 我在哪裡 我在幹嘛";
          break;
        case "2":
          mood.innerHTML = "心情：&#128532 好難ＲＲＲ 覺得自己有點廢";
          break;
        case "3":
          mood.innerHTML = "心情： &#128531 雖然有點吃力 但還是完成了";
          break;
        case "4":
          mood.innerHTML = "心情： &#128524 不再感到吃力 有成就感";
          break;
        case "5":
          mood.innerHTML = "心情： &#128556 哎喔 慢慢找到感覺了喔";
          break;
        case "6":
          mood.innerHTML = "心情： &#128538 得心應手 難不倒我";
          break;
        case "7":
          mood.innerHTML = "心情： &#128548 輕輕鬆鬆 只用一根手指頭";
          break;
        };
        for (const i in data.data.inputData) {
          const datarow = document.querySelector("#data");
          const dataDiv = document.createElement("div");
          dataDiv.className = "col-4 text-center";
          const dataValue = document.createElement("h4");
          dataValue.innerHTML = `${data.data.inputData[i].name}:${data.data.inputData[i].value}${data.data.inputData[i].unit}`;
          dataValue.id = "dataValue";
          dataDiv.appendChild(dataValue);
          datarow.appendChild(dataDiv);
        }
        const diaryContent = document.querySelector("#diaryContent");
        diaryContent.innerHTML = data.data.basicInfo.content;
        const diaryImages = document.querySelector("#diaryImages");
        for (const k in data.data.images) {
          const imageDiv = document.createElement("div");
          imageDiv.className = "col-3 diaryImage";
          const diaryImage = document.createElement("img");
          diaryImage.src = `${data.data.images[k].path}`;
          imageDiv.appendChild(diaryImage);
          diaryImages.appendChild(imageDiv);
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
  }).then(result => {
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
        window.location.assign(`/diary?progressid=${progressId}&diaryid=${diaryId}`);
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
