// Get API query parameter
let token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get("category");
const keyword = urlParams.get("keyword");
console.log(category);
if (category) {
  getProgressData ();
}
if (keyword) {
  getSearchData ();
}

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
  let myprogress = document.querySelector("#myprogress");
  myprogress.href = `myProgress?userid=${myID}`;
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

function getProgressData () {
  fetch(`/api/1.0/progress?category=${category}`,{
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
        for (let k in data.data) {
          let progressDiv = document.createElement('div');
          progressDiv.className = "col-3 groupProgress";
          progresses.appendChild(progressDiv);
          let progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href=`/progress?progressid=${data.data[k].id}`;
          progressDiv.appendChild(progressLink);
          progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.data[k].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.data[k].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
        }
      }
    });
}

function getSearchData () {
  console.log("search")
  fetch(`/api/1.0/progress?keyword=${keyword}`,{
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
        if (data.data.length == 0) {
          console.log("here");
          let noresult = document.querySelector('.noresult');
          noresult.style.display = "flex";
        }
        for (let k in data.data) {
          let progressDiv = document.createElement('div');
          progressDiv.className = "col-3 groupProgress";
          progresses.appendChild(progressDiv);
          let progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href=`/progress?progressid=${data.data[k].id}`;
          progressDiv.appendChild(progressLink);
          progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.data[k].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.data[k].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
        }
      }
    });
}

function search () {
  let keyword = document.querySelector('#search').value;
  if (keyword !== '') {
    window.location.assign(`/category.html?keyword=${keyword}`);
  } 
}