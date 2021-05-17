let token = localStorage.getItem("token")
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");

// Get API query parameter
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
        name.value = data.data.name;
        let motivation = document.querySelector("#motivation");
        motivation.value = data.data.motivation;
        let category = document.querySelector("#category");
        category.value = data.data.category;
        let image = document.querySelector('#image');
        image.src = data.data.picture;
        if (data.data.public == '1') {
          let public = document.querySelector('#checkPrivacy')
          public.setAttribute('checked', true);
        } 
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
      alert("登入逾期，請重新登入");
      return window.location.assign('/signin.html');
    }
  })
  ev.preventDefault();
}, false);          