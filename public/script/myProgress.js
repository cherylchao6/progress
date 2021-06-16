// Get API query parameter
const token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userid");
getUserInfo();
getMyProgressData();
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

// get Author profile
function getUserInfo () {
  fetch(`/api/1.0/user?userid=${userId}`, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` }
  }).then(response => {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign("/signin");
    } else if (response.status === 403) {
      alert("登入逾期");
      return window.location.assign("/signin");
    }
  })
    .then(data => {
      if (data) {
        console.log(data);
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
        const followBtn = document.querySelector("#followBtn");
        const msgBtn = document.querySelector("#MessageBtn");
        const addBtnRow = document.querySelector("#addBtnRow");
        if (data.author == data.vistor) {
          editProfile.style.display = "flex";
          followBtn.style.display = "none";
          msgBtn.style.display = "none";
          addBtnRow.style.display = "flex";
        }
        const finishedProgress = document.querySelector("#finishedProgress");
        const unfinishedProgress = document.querySelector("#unfinishedProgress");
        finishedProgress.innerHTML = `${data.finishedProgress}</br>Progress</br>Finished</br>`;
        unfinishedProgress.innerHTML = `${data.unfinishedProgress}</br>Progress</br>To Go</br>`;
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

function joinGroupProgress () {
  Swal.fire({
    title: "請輸入邀請碼",
    width: "400px",
    imageUrl: "https://i.imgur.com/yptcZAT.png",
    imageWidth: 350,
    imageHeight: 233,
    showCancelButton: true,
    confirmButtonColor: "#132235",
    cancelButtonColor: "#6ddad3",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    html:
      "<input type=\"text\" id=\"invitationCodeinput\" name=\"invitationCodeinput\" class=\"swal2-input\">"
  }).then(result => {
    const invitationCode = document.querySelector("#invitationCodeinput").value;
    if (result.value && invitationCode.value !== "") {
      const data = {
        invitationCode
      };
      fetch("/checkInvitation", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        }
      })
        .then(response => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 403) {
            console.log("請輸入正確邀請碼");
            Swal.fire(
              {
                title: "請輸入正確邀請碼",
                icon: "error",
                confirmButtonColor: "#132235",
                confirmButtonText: "OK"
              }
            );
          }
        })
        .then(data => {
        // suppose會是groupprogress id
          if (data) {
            console.log("join.....");
            console.log(data);
            Swal.fire(
              {
                title: "加入成功",
                text: "將進入群組 Progress",
                icon: "success",
                confirmButtonColor: "#132235",
                confirmButtonText: "OK"
              }
            );
            setTimeout(function () { window.location.assign(`/groupProgress?id=${data.groupProgressID}`); }, 2000);
          }
        });
    }
  });
}

function getMyProgressData () {
  fetch(`/api/1.0/myprogress?userid=${userId}`, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` }
  }).then(response => {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign("/signin");
    } else if (response.status === 403) {
      alert("登入逾期");
      return window.location.assign("/signin");
    }
  })
    .then(data => {
      if (data) {
        console.log(data);
        // 先append個人的
        if (data.personal.length == 0 && data.group.length == 0) {
          const noProgress = document.querySelector("#noProgress");
          noProgress.style.display = "flex";
        }
        const progresses = document.querySelector("#progresses");
        for (const i in data.personal) {
          const progressDiv = document.createElement("div");
          progressDiv.className = "col-3";
          progresses.appendChild(progressDiv);
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `/progress?progressid=${data.personal[i].id}`;
          progressDiv.appendChild(progressLink);
          progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.personal[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.personal[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
        }
        for (const k in data.group) {
          const progressDiv = document.createElement("div");
          progressDiv.className = "col-3 groupProgress";
          progresses.appendChild(progressDiv);
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `/groupProgress?id=${data.group[k].id}`;
          progressDiv.appendChild(progressLink);
          progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.group[k].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.group[k].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          const iconImg = document.createElement("img");
          iconImg.src = "./images/networking.png";
          iconImg.className = "groupIcon";
          progressDiv.appendChild(iconImg);
        }
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
    idol: userId
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
        window.location.assign(`/myProgress?userid=${userId}`);
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
