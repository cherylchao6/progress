//add new input form when click plus button
function addInputForm (id) {
  let formId = id+1;
  let plusButton = document.querySelector(`#addInputForm${id}`);
  let form = document.querySelector(`#inputForm${formId}`)
  plusButton.addEventListener('click', ()=>{
    form.style.display = "inline";
  });
}
addInputForm(1);
addInputForm(2);

// Get API query parameter
let token = localStorage.getItem("token")
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");
getProgressData ();
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

//get progress data
function getProgressData () {
  fetch(`/api/1.0/progress?progressid=${progressId}`,{
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
        let name = document.querySelector("#progressName");
        name.value = data.data.progress.name;
        let motivation = document.querySelector("#motivation");
        motivation.value = data.data.progress.motivation;
        let category = document.querySelector("#category");
        category.value = data.data.progress.category;
        let image = document.querySelector('#image');
        image.src = data.data.progress.picture;
        if (data.data.progress.public == '1') {
          let public = document.querySelector('#checkPrivacy')
          public.setAttribute('checked', true);
        }
        //判斷幾組數據並顯示數單表單
        let form2 = document.querySelector('#inputForm2');
        let form3 = document.querySelector('#inputForm3');
        switch ((data.data.progressData).length) {
          case 2 :
            form2.style.display = "inline";
            break;
          case 3 :
            form2.style.display = "inline";
            form3.style.display = "inline";
            break;
        };
        for (let i in data.data.progressData) {
          let id = parseInt(i) + 1;
          let inputName = document.querySelector(`#input${id}Name`);
          let inputUnit = document.querySelector(`#input${id}Unit`);
          inputName.value = data.data.progressData[i].name;
          inputUnit.value = data.data.progressData[i].unit;    
        };
      } 
    });
}

//Preview Progress封面照
previewBeforeUpload("file-0");


//Preview Uploaded Pictures
function previewBeforeUpload(id) {
  let fileInput = document.querySelector("#"+id)
  // removePicture
  document.querySelector("#"+id+"-removebtn").addEventListener("click", function(){
    document.querySelector("#"+id).value="";
    document.querySelector("#"+id+"-preview div").innerText = "Progress封面";
    document.querySelector("#"+id+"-preview img").src = 'https://bit.ly/3ubuq5o';
  });
  document.querySelector("#"+id).addEventListener("change",function(){
    if(fileInput.files.length == 0){
      return;
    }
    let file = fileInput.files[0];
    let url = URL.createObjectURL(file);
    document.querySelector("#"+id+"-preview div").innerText = file.name;
    document.querySelector("#"+id+"-preview img").src = url;
  });
}

//Submit form 
let form = document.forms.namedItem("addProgress");
form.addEventListener ("submit", function(ev){
  let src = document.querySelector('#image').src;
  let data = new FormData(form);
  data.append("src", `${src}`);
  fetch(`/editProgress?progressid=${progressId}`, {
    method: 'POST',
    body: data,
    headers: { 'authorization': `Bearer ${token}`},
  })
  .then(function (response) {
    if (response.status === 200) {
      Swal.fire(
        {
          title:"修改Progress成功",
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
      alert("登入逾期");
      return window.location.assign('/signin.html');
    } else if (response.status === 405) {
      alert("無權限");
      return window.location.assign('/signin.html');
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

function search () {
  let keyword = document.querySelector('#search').value;
  if (keyword !== '') {
    window.location.assign(`/category.html?keyword=${keyword}`);
  } 
}