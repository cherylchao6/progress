let token = localStorage.getItem("token")
//add new input form when click plus button
function addInputForm (id) {
  let formId = id+1;
  let plusButton = document.querySelector(`#addInputForm${id}`);
  let form = document.querySelector(`#inputForm${formId}`)
  plusButton.addEventListener('click', ()=>{
    console.log("here");
    form.style.display = "inline";
  });
}
addInputForm(1);
addInputForm(2);

function minusInputForm (id) {
  let minusButton = document.querySelector(`#minusInputForm${id}`);
  let form = document.querySelector(`#inputForm${id}`);
  minusButton.addEventListener('click', ()=>{
    document.querySelector(`#input${id}Name`).value = "";
    document.querySelector(`#input${id}Unit`).value = "";
    form.style.display = "none";
  });
}
minusInputForm(2);
minusInputForm(3);

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
  let fileInput = document.querySelector("#"+id);
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
//Submit form 
let form = document.forms.namedItem("addProgress");
form.addEventListener ("submit", function(ev){
  let data = new FormData(form);
  fetch('/addProgress', {
    method: 'POST',
    body: data,
    headers: { 'authorization': `Bearer ${token}` },
  })
  .then(async (response) => {
    if (response.status === 200) {
      Swal.fire(
        {
          title:"新增Progress成功",
          icon:"success",
          confirmButtonColor: '#132235',
          confirmButtonText: 'OK',
        }
      ).then(()=>{
        window.location.assign(`/myProgress?userid=${myID}`);
      });
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign('/signin.html');
    } else if (response.status === 403) {
      alert("登入逾期，請重新登入");
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

function signOut () {
  Swal.fire({
    title:"確定要登出嗎？",
    icon: 'warning',
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

function waitingAlert () {
  let progressName = document.querySelector('#progressName');
  let motivation = document.querySelector('#motivation');
  if (progressName.value !== "" && motivation.value !== "") {
    Swal.fire({
      title:"上傳中請稍候",
      icon: 'warning',
      showCancelButton: false,
      showConfirmButton: false
    });
  }
}

function hasInput() {
  document.querySelector('#input1Name').value = "";
  document.querySelector('#input1Unit').value = "";
  document.querySelector('#input2Name').value = "";
  document.querySelector('#input2Unit').value = "";
  document.querySelector('#input3Name').value = "";
  document.querySelector('#input3Unit').value = "";
  let hasInput = document.querySelector("#addNum").checked;
  let inputForm1 = document.querySelector("#inputForm1");
  let inputForm2 = document.querySelector("#inputForm2");
  let inputForm3 = document.querySelector("#inputForm3");
  if (hasInput) {
    inputForm1.style.display = "block";
  } else {
    inputForm1.style.display = "none";
    inputForm2.style.display = "none";
    inputForm3.style.display = "none";
  }
}