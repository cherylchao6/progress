// Get API query parameter
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");
const diaryId = urlParams.get("diaryid");
const token = localStorage.getItem("token");

// Diary data API
getDiaryData();
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
  ;
  if (toWhom == myID) {
    msgBadge.style.display = "block";
  }
});

function getDiaryData () {
  fetch(`/api/1.0/diary?progressid=${progressId}&diaryid=${diaryId}`, {
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
    .then(response => {
      if (response) {
        const data = response.data;
        // //sql資料填入input
        const date = document.querySelector("#date");
        date.value = data.basicInfo.date;
        switch (data.basicInfo.mood) {
        case "1":
          const option1 = document.querySelector("#option1");
          option1.selected = "selected";
          break;
        case "2":
          const option2 = document.querySelector("#option2");
          option2.selected = "selected";
          break;
        case "3":
          const option3 = document.querySelector("#option3");
          option3.selected = "selected";
          break;
        case "4":
          const option４ = document.querySelector("#option4");
          option4.selected = "selected";
          break;
        case "5":
          const option5 = document.querySelector("#option5");
          option5.selected = "selected";
          break;
        case "6":
          const option6 = document.querySelector("#option6");
          option6.selected = "selected";
          break;
        case "7":
          const option7 = document.querySelector("#option7");
          option7.selected = "selected";
          break;
        };
        const content = document.querySelector("#content");
        content.value = data.basicInfo.content;
        const form1 = document.querySelector("#inputForm1");
        const form2 = document.querySelector("#inputForm2");
        const form3 = document.querySelector("#inputForm3");
        switch ((data.inputData).length) {
        case 1:
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
        }
        for (const i in data.inputData) {
          const id = parseInt(i) + 1;
          const inputName = document.querySelector(`#input${id}Name`);
          const inputValue = document.querySelector(`#input${id}`);
          const inputUnit = document.querySelector(`#input${id}Unit`);
          inputName.value = data.inputData[i].name;
          inputValue.value = data.inputData[i].value;
          inputUnit.value = data.inputData[i].unit;
        };
        const mainImage = document.querySelector("#mainImage");
        mainImage.src = data.basicInfo.main_image;
        for (const j in data.images) {
          const id = parseInt(j) + 1;
          const image = document.querySelector(`#image${id}`);
          const imageName = document.querySelector(`#uploadDiv${id}`);
          image.src = data.images[j].path;
          imageName.innerText = data.images[j].fileName;
        }
      }
    });
}
// Preview Uploaded Pictures
function previewBeforeUploadCover (id) {
  const fileInput = document.querySelector("#" + id);
  // removePicture
  document.querySelector("#" + id + "-removebtn").addEventListener("click", function () {
    document.querySelector("#" + id).value = "";
    document.querySelector("#" + id + "-preview div").innerText = "日記封面";
    document.querySelector("#" + id + "-preview img").src = "https://bit.ly/3ubuq5o";
  });
  document.querySelector("#" + id).addEventListener("change", function () {
    if (fileInput.files.length == 0) {
      return;
    }
    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);
    document.querySelector("#" + id + "-preview div").innerText = file.name;
    document.querySelector("#" + id + "-preview img").src = url;
  });
}
function previewBeforeUpload (id) {
  const fileInput = document.querySelector("#" + id);
  // removePicture
  document.querySelector("#" + id + "-removebtn").addEventListener("click", function () {
    document.querySelector("#" + id).value = "";
    document.querySelector("#" + id + "-preview div").innerText = "日記照片";
    document.querySelector("#" + id + "-preview img").src = "https://bit.ly/3ubuq5o";
  });
  document.querySelector("#" + id).addEventListener("change", function () {
    if (fileInput.files.length == 0) {
      return;
    }
    const file = fileInput.files[0];
    const url = URL.createObjectURL(file);
    document.querySelector("#" + id + "-preview div").innerText = file.name;
    document.querySelector("#" + id + "-preview img").src = url;
  });
}
// 日記封面照
previewBeforeUploadCover("file-0");
previewBeforeUpload("file-1");
previewBeforeUpload("file-2");
previewBeforeUpload("file-3");
previewBeforeUpload("file-4");
previewBeforeUpload("file-5");
previewBeforeUpload("file-6");
previewBeforeUpload("file-7");
previewBeforeUpload("file-8");

// Submit form
const form = document.forms.namedItem("addDiary");
form.addEventListener("submit", function (ev) {
  const data = new FormData(form);
  const mainImageSrc = document.querySelector("#mainImage").src;
  const splitArray = mainImageSrc.split("/");
  const index = splitArray.length - 1;
  const encodefilename = splitArray[index];
  // 轉為是中文檔名
  const mainImageName = decodeURIComponent(encodefilename);
  const imageSrcArray = [];
  for (let k = 1; k < 9; k++) {
    selectImagesSrc(k);
  }
  function selectImagesSrc (id) {
    const imagesSrc = document.querySelector(`#image${id}`).src;
    imageSrcArray.push(imagesSrc);
  }
  data.append("mainImageSrc", `${mainImageSrc}`);
  data.append("imagesSrc", `${imageSrcArray}`);
  fetch(`/editDiary?progressid=${progressId}&diaryid=${diaryId}`, {
    method: "POST",
    body: data,
    headers: { authorization: `Bearer ${token}` }
  })
    .then(async (response) => {
      if (response.status === 200) {
        Swal.fire(
          {
            title: "修改日記成功",
            icon: "success",
            confirmButtonColor: "#132235",
            confirmButtonText: "OK"
          }
        ).then(() => {
          window.location.assign(`/progress?progressid=${progressId}`);
        });
        return response.json();
      } else if (response.status === 401) {
        alert("請先登入");
        return window.location.assign("/signin.html");
      } else if (response.status === 403) {
        alert("登入逾期，請重新登入");
        return window.location.assign("/signin.html");
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
      } else if (response.status === 400) {
        const msg = await response.json();
        Swal.fire(
          {
            title: msg.error,
            icon: "warning",
            confirmButtonColor: "#132235",
            confirmButtonText: "OK"
          }
        );
      }
    });
  ev.preventDefault();
}, false);

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

function waitingAlert () {
  const date = document.querySelector("#date");
  if (date.value !== "") {
    Swal.fire({
      title: "上傳中請稍候",
      icon: "warning",
      showCancelButton: false,
      showConfirmButton: false
    });
  }
}
