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
  if (hasUnread == "true") {
    msgBadge.style.display = 'block';
  }
});
//上線狀態但在看別頁的時候有人密我
socket.on(`newMsgNotification`, toWhom => {
  if (toWhom == myID) {
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
      } else if (response.status === 500) {
        Swal.fire(
          {
            title:"檔案請勿超過1MB",
            text: "請重新上傳一張小一點點的喔",
            icon:"error",
            confirmButtonColor: '#132235',
            confirmButtonText: 'OK',
          }
        );
      } else if (response.status === 400) {
        return window.location.assign('/signin.html');
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
          let public = document.querySelector('#checkPrivacy');
          public.setAttribute('checked', true);
        }
        //判斷幾組數據並顯示數單表單
        let form1 = document.querySelector('#inputForm1');
        let form2 = document.querySelector('#inputForm2');
        let form3 = document.querySelector('#inputForm3');
        let hasInput = document.querySelector("#addNum");
        if ((data.data.progressData).length !== 0) {
          hasInput.setAttribute('checked', true);
        }
        switch ((data.data.progressData).length) {
          case 1 :
            form1.style.display = "inline";
            break;
          case 2 :
            form1.style.display = "inline";
            form2.style.display = "inline";
            break;
          case 3 :
            form1.style.display = "inline";
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
  .then(async (response) => {
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