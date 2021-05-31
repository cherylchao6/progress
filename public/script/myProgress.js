// Get API query parameter
let token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userid");
getUserInfo ();
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


//get Author profile 
function getUserInfo () {
  fetch(`/api/1.0/user?userid=${userId}`,{
    method: "GET",
    headers: { 'authorization': `Bearer ${token}` },
  }).then(response => {
    if (response.status === 200 ) {
      return response.json();
    } else if (response.status === 401) {
      alert('請先登入');
      return window.location.assign('/signin');
      } else if (response.status === 403) {
        alert('登入逾期');
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
        // let finishedProgress = document.querySelector('#finishedProgress');
        // finishedProgress.innerHTML = data.finishedProgress;
        let motto = document.querySelector('#motto');
        motto.innerHTML = data.motto;
        let userPicture = document.querySelector('#userPicture');
        userPicture.src = data.photo;
        let editProfile = document.querySelector('#editProfile');
        let followBtn = document.querySelector("#followBtn");
        let msgBtn = document.querySelector('#MessageBtn');
        if (data.author == data.vistor) {
          editProfile.style.display = "flex";
          followBtn.style.display = "none";
          msgBtn.style.display = "none";
        }
        let finishedProgress = document.querySelector('#finishedProgress');
        let unfinishedProgress = document.querySelector('#unfinishedProgress');
        finishedProgress.innerHTML = `${data.finishedProgress}</br>Progress</br>Finished</br>`;
        unfinishedProgress.innerHTML = `${data.unfinishedProgress}</br>Progress</br>To Go</br>`;
      }
    });
}

function signOut () {
  Swal.fire({
    title:"確定要登出嗎？",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#132235',
    cancelButtonColor: '#6ddad3',
    confirmButtonText: '確定',
    cancelButtonText:'取消'
  }).then(result =>{
    if (result.value) {
      Swal.fire(
        {
          title:"登出成功",
          type:"success",
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