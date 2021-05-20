
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