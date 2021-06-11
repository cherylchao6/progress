// Get API query parameter
const urlParams = new URLSearchParams(window.location.search);
const groupProgressID = urlParams.get("id");
let token = localStorage.getItem("token");
getGroupProgressData ();

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

//Preview Uploaded Pictures
function previewBeforeUpload(id) {
  let fileInput = document.querySelector("#"+id)
  document.querySelector("#"+id).addEventListener("change",function(){
    if(fileInput.files.length == 0){
      return;
    }
    let file = fileInput.files[0];
    let url = URL.createObjectURL(file);
    document.querySelector("#"+id+"-preview div").innerText = file.name;
    document.querySelector("#"+id+"-preview img").src = url;
    // removePicture
    document.querySelector("#"+id+"-removebtn").addEventListener("click", function(){
      document.querySelector("#"+id).value="";
      document.querySelector("#"+id+"-preview div").innerText = "Progress封面";
      document.querySelector("#"+id+"-preview img").src = 'https://bit.ly/3ubuq5o';
    });
  });
}
//Preview Progress封面照
previewBeforeUpload("file-0");
document.querySelector("#file-0-removebtn").addEventListener("click", function(){
  document.querySelector("#file-0").value="";
  document.querySelector("#file-0-preview div").innerText = "Progress封面";
  document.querySelector("#file-0-preview img").src = 'https://bit.ly/3ubuq5o';
});
//顯示結束日期
function hasEndDate() {
  document.querySelector('#endDate').value = "";
  let hasEndDate = document.querySelector("#hasEndDate").checked;
  let endDate = document.querySelector("#endDateDiv");
  if (hasEndDate) {
    endDate.style.display = "block";
  } else {
    endDate.style.display = "none";
  }
}

//Submit form 
let form = document.forms.namedItem("editGroupProgress");
form.addEventListener ("submit", function(ev){
  let src = document.querySelector('#progressImg').src;
  let data = new FormData(form);
  data.append("src", `${src}`);
  fetch(`/editGroupProgress?id=${groupProgressID}`, {
    method: 'POST',
    body: data,
    headers: { 'authorization': `Bearer ${token}`},
  })
  .then(async (response) => {
    if (response.status === 200) {
      Swal.fire(
        {
          title:"修改群組Progress成功",
          icon:"success",
          confirmButtonColor: '#132235',
          confirmButtonText: 'OK',
        }
      ).then(()=>{
        window.location.assign(`/groupProgress?id=${groupProgressID}`);
      });
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign('/signin.html');
    } else if (response.status === 403) {
      alert("登入逾期");
      return window.location.assign('/signin.html');
    } else if (response.status === 405) {
      alert("無權限");
      return window.location.assign('/signin.html');
    } else if (response.status === 500) {
      let msg = await response.json();
      if (msg.error.message == "File too large") {
        Swal.fire(
          {
            title:"檔案請勿超過1MB",
            text: "請重新上傳一張小一點點的喔",
            icon:"error",
            confirmButtonColor: '#132235',
            confirmButtonText: 'OK',
          }
        );
      } else {
        Swal.fire(
          {
            title:"伺服器維修中",
            text: "真的很抱歉喔～請稍後再使用",
            icon:"error",
            confirmButtonColor: '#132235',
            confirmButtonText: 'OK',
          }
        );
      }
    } else if (response.status === 400) {
      let msg= await response.json();
      Swal.fire(
        {
          title:msg.error,
          icon:"warning",
          confirmButtonColor: '#132235',
          confirmButtonText: 'OK',
        }
      );
      return;
    }
  });
  ev.preventDefault();
}, false);


function getGroupProgressData () {
  fetch(`/api/1.0/groupProgress?id=${groupProgressID}`,{
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
        // //sql資料填入input
        console.log(data);
        let endDateDiv = document.querySelector("#endDateDiv");
        let hasEndDate = document.querySelector("#hasEndDate");
        if (data.basicInfo.end_date !== "") {
          endDateDiv.style.display = "block";
          hasEndDate.setAttribute('checked', true);
        }
        let progressName = document.querySelector("#progressName");
        progressName.value = data.basicInfo.name;
        let motivation = document.querySelector("#motivation");
        motivation.value = data.basicInfo.motivation;
        let category = document.querySelector("#category");
        category.value = data.basicInfo.category;
        let startDate = document.querySelector("#startDate");
        startDate.value = data.basicInfo.start_date;
        let endDate = document.querySelector("#endDate");
        endDate.value = data.basicInfo.end_date;
        let input1Name = document.querySelector("#input1Name");
        input1Name.value = data.basicInfo.goal_verb;
        let input1Num = document.querySelector("#input1Num");
        input1Num.value = data.basicInfo.goal_num;
        let input1Unit = document.querySelector("#input1Unit");
        input1Unit.value = data.basicInfo.goal_unit;
        let progressImg = document.querySelector("#progressImg");
        progressImg.src = data.basicInfo.picture;
      } 
    });
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
  }).then(result => {
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

function checkDate() {
  console.log("checkcheck");
  if(document.querySelector('#endDate').value !== '' && document.querySelector('#startDate').value !== '') {
    console.log("checkDate");
    let startDate = document.querySelector('#startDate').value;
    let endDate = document.querySelector('#endDate').value;
    console.log(startDate);
    console.log(endDate);
    let newStartDate = new Date(startDate);
    let newEndDate = new Date(endDate);
    console.log(newStartDate);
    console.log(newEndDate);
    if (newStartDate > newEndDate) {
      Swal.fire({
        title:"結束日期不得早於開始日期",
        icon: "warning",
        confirmButtonColor: '#132235',
        confirmButtonText: 'OK',
      });
    }
  }
}

function search () {
  let keyword = document.querySelector('#search').value;
  if (keyword !== '') {
    window.location.assign(`/category.html?keyword=${keyword}`);
  } 
}

function waitingAlert () {
  let progressName = document.querySelector('#progressName');
  let motivation = document.querySelector('#motivation');
  let startDate = document.querySelector('#startDate');
  let input1Name = document.querySelector('#input1Name');
  let input1Num = document.querySelector('#input1Num');
  let input1Unit = document.querySelector('#input1Unit');
  if (progressName.value !== "" && motivation.value !== "" && startDate.value !== "" && input1Name.value !== "" && input1Num.value !== "" && input1Unit.value !== "") {
    Swal.fire({
      title:"上傳中請稍候",
      icon: 'warning',
      showCancelButton: false,
      showConfirmButton: false
    });
  }
}
