// Get API query parameter
let token = localStorage.getItem("token")
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");

getProgressData ();

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
        //判斷幾組數據並顯示數單表單
        let form1 = document.querySelector('#inputForm1');
        let form2 = document.querySelector('#inputForm2');
        let form3 = document.querySelector('#inputForm3');
        switch ((data.data.progressData).length) {
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
        };
        for (let i in data.data.progressData) {
          let id = parseInt(i) + 1;
          let inputName = document.querySelector(`#input${id}Name`);
          let inputUnit = document.querySelector(`#input${id}Unit`);
          inputName.value = data.data.progressData[i].name;
          inputUnit.value = data.data.progressData[i].unit;    
        }
      } 
    });
}

//Preview Uploaded Pictures
function previewBeforeUploadCover(id){
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
      document.querySelector("#"+id+"-preview div").innerText = "日記封面";
      document.querySelector("#"+id+"-preview img").src = 'https://bit.ly/3ubuq5o';
    })
  });
}
function previewBeforeUpload(id){
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
      document.querySelector("#"+id+"-preview div").innerText = "日記照片";
      document.querySelector("#"+id+"-preview img").src = 'https://bit.ly/3ubuq5o';
    })
  });
}
//日記封面照
previewBeforeUploadCover("file-0");
previewBeforeUpload("file-1");
previewBeforeUpload("file-2");
previewBeforeUpload("file-3");
previewBeforeUpload("file-4");
previewBeforeUpload("file-5");
previewBeforeUpload("file-6");
previewBeforeUpload("file-7");
previewBeforeUpload("file-8");

//Submit form 
let form = document.forms.namedItem("addDiary");
form.addEventListener ("submit", function(ev){
  let data = new FormData(form);
  fetch(`/addDiary?progressId=${progressId}`, {
    method: 'POST',
    body: data,
    headers: { 'authorization': `Bearer ${token}` },
  })
  .then(function (response) {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign('/signin.html');
    } else if (response.status === 403) {
      alert("登入逾期，請重新登入");
      return window.location.assign('/signin.html');
    }
  })
  ev.preventDefault();
}, false);      
