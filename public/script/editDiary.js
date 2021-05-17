// Get API query parameter
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");
const diaryId = urlParams.get("diaryid");
let token = localStorage.getItem("token");
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
//Diary data API
getDiaryData ();
function getDiaryData () {
  fetch(`/api/1.0/diary?progressid=${progressId}&diaryid=${diaryId}`,{
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
    .then (response => {
      if (response) {
        let data = response.data;
        // //sql資料填入input
        let date = document.querySelector("#date");
        date.value = data.basicInfo.date;
        switch(data.basicInfo.mood){
          case '1':
            let option1 = document.querySelector("#option1");
            option1.selected="selected";
            break;
          case '2':
            let option2 = document.querySelector("#option2");
            option2.selected="selected";
            break;
          case '3':
            let option3 = document.querySelector("#option3");
            option3.selected="selected";
            break;
          case '4':
            let option４ = document.querySelector("#option4");
            option4.selected="selected";
            break;
          case '5':
            let option5 = document.querySelector("#option5");
            option5.selected="selected";
            break;
          case '6':
            let option6 = document.querySelector("#option6");
            option6.selected="selected";
            break;
          case '7':
            let option7 = document.querySelector("#option7");
            option7.selected="selected";
            break;       
        };
        let content = document.querySelector("#content");
        content.value = data.basicInfo.content;
        let form2 = document.querySelector('#inputForm2');
        let form3 = document.querySelector('#inputForm3');
        switch ((data.inputData).length) {
          case 2 :
            form2.style.display = "inline";
            break;
          case 3 :
            form2.style.display = "inline";
            form3.style.display = "inline";
            break;
        }
        for (let i in data.inputData) {
          let id = parseInt(i) + 1;
          let inputName = document.querySelector(`#input${id}Name`);
          let inputValue = document.querySelector(`#input${id}`);
          let inputUnit = document.querySelector(`#input${id}Unit`);
          inputName.value = data.inputData[i].name;
          inputValue.value = data.inputData[i].value;
          inputUnit.value = data.inputData[i].unit;    
        };
        let mainImage = document.querySelector('#mainImage');
        mainImage.src = data.basicInfo['main_image'];
        for (let j in data.images) {
          let id = parseInt(j) + 1;
          let image = document.querySelector(`#image${id}`);
          let imageName = document.querySelector(`#uploadDiv${id}`);
          image.src = data.images[j].path;
          imageName.innerText = data.images[j].fileName;
        }
      } 
    });
}
//Preview Uploaded Pictures
function previewBeforeUploadCover(id){
  let fileInput = document.querySelector("#"+id)
  // removePicture
  document.querySelector("#"+id+"-removebtn").addEventListener("click", function(){
    document.querySelector("#"+id).value="";
    document.querySelector("#"+id+"-preview div").innerText = "日記封面";
    document.querySelector("#"+id+"-preview img").src = 'https://bit.ly/3ubuq5o';
  })
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
function previewBeforeUpload(id) {
  let fileInput = document.querySelector("#"+id)
  // removePicture
  document.querySelector("#"+id+"-removebtn").addEventListener("click", function(){
    document.querySelector("#"+id).value="";
    document.querySelector("#"+id+"-preview div").innerText = "日記照片";
    document.querySelector("#"+id+"-preview img").src = 'https://bit.ly/3ubuq5o';
  })
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

// let mainImageSrc = document.querySelector('#mainImage').src
// console.log(mainImageSrc);
// let imageSrcArray = [];
// for (let k=1; k<9; k++) {
//   selectImagesSrc(k)
// }
// function selectImagesSrc (id) {
//   let imagesSrc = document.querySelector(`#image${id}`).src;
//   imageSrcArray.push(imagesSrc);
// }
// console.log(imageSrcArray);
//Submit form 
let form = document.forms.namedItem("addDiary");
form.addEventListener ("submit", function(ev){
  let data = new FormData(form);
  let mainImageSrc = document.querySelector('#mainImage').src;
  let splitArray = mainImageSrc.split('/');
  let index = splitArray.length - 1;
  let encodefilename = splitArray[index];
  //轉為是中文檔名
  let mainImageName = decodeURIComponent(encodefilename);
  console.log(mainImageName);
  let imageSrcArray = [];
  for (let k=1; k<9; k++) {
  selectImagesSrc(k)
  }
  function selectImagesSrc (id) {
    let imagesSrc = document.querySelector(`#image${id}`).src;
    imageSrcArray.push(imagesSrc);
  }
  data.append("mainImageSrc", `${mainImageSrc}`);
  data.append("imagesSrc", `${imageSrcArray}`)
  fetch(`/editDiary?progressId=${progressId}&diaryid=${diaryId}`,{
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