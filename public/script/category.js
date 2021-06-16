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
  fetch(`/api/1.0/progressSearch?category=${category}`,{
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
        console.log("here");
        let title = document.getElementsByClassName('title');
        for (let i=0; i < title.length; i++) {
            title[i].style.display = "none";
        }
         
        let progresses = document.querySelector('#progresses');
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
  console.log("search");
  fetch(`/api/1.0/progressSearch?keyword=${keyword}`,{
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
        if (data.data.length == 0 && data.users.length == 0) {
          let noresult = document.querySelector('.noresult');
          noresult.style.display = "flex";
          let title = document.getElementsByClassName('title');
          for (let i=0; i < title.length; i++) {
            title[i].style.display = "none";
          }
          let myProgrssMain = document.getElementsByClassName('myProgrssMain');
          for (let i=0; i < myProgrssMain.length; i++) {
            myProgrssMain[i].style.display = "none";
          }
        }
        if (data.data.length == 0) {
          let noProgressHint = document.querySelector('.noProgressHint');
          noProgressHint.style.display = "block";
        }
        let progresses = document.querySelector('#progresses');
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
        if (data.users.length == 0) {
          let noUserHint = document.querySelector('.noUserHint');
          noUserHint.style.display = "block";
        }
        let users = document.querySelector('#users');
        for (let k in data.users) {
          let progressDiv = document.createElement('div');
          progressDiv.className = "col-3 groupProgress";
          users.appendChild(progressDiv);
          let progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href=`/myProgress?userid=${data.users[k].id}`;
          progressDiv.appendChild(progressLink);
          progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.users[k].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.users[k].photo;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
        }
      }
    });
}

let searchInput = document.querySelector("#search");
searchInput.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
      event.preventDefault();
      search ();
  }
});
function search () {
  let keyword = document.querySelector('#search').value;
  if (keyword !== '') {
    window.location.assign(`/category.html?keyword=${keyword}`);
  } 
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