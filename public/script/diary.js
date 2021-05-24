// Get API query parameter
let token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const progressId = urlParams.get("progressid");
const diaryId = urlParams.get("diaryid");
let progressLink = document.querySelector("#progressLink");
progressLink.href = `/progress?progressid=${progressId}`;
getDiary ();
getAuthorProfile ();

//get Author profile 
function getAuthorProfile () {
  fetch(`/api/1.0/author/?progressid=${progressId}`,{
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
        console.log(data);
        //看是不是本人
        let editProfile = document.querySelector('#editProfile');
        let editDiary = document.querySelector('#editDiary');
        let editDiaryLink = document.querySelector('#editDiaryLink');
        if (data.author == data.vistor) {
          editProfile.style.display = "flex";
          editDiary.style.display = "block";
          //在這裡改連結
          editDiaryLink.href=`/editDiary?progressid=${progressId}&diaryid=${diaryId}`;
        }
        let userName = document.querySelector('#userName');
        userName.innerHTML = data.name;
        let fans = document.querySelector('#fans');
        fans.innerHTML = `粉絲 ${data.follower}`;
        let idols = document.querySelector('#idols');
        idols.innerHTML = `偶像 ${data.following}`;
        let finishedProgress = document.querySelector('#finishedProgress');
        finishedProgress.innerHTML = data.finishedProgress;
        let motto = document.querySelector('#motto');
        motto.innerHTML = data.motto;
        let userPicture = document.querySelector('#userPicture');
        userPicture.src = data.photo;
      }
    });
}

//get Author profile 
function getDiary () {
  fetch(`/api/1.0/diary/?progressid=${progressId}&diaryid=${diaryId}`,{
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
        console.log(data);
        let progressName = document.querySelector("#progressName");
        progressName.innerHTML = data.progressInfo.name;
        let category = document.querySelector("#category");
        category.innerHTML = `類別：${data.progressInfo.category}`;
        let motivation = document.querySelector("#motivation");
        motivation.innerHTML = data.progressInfo.motivation;
        let diaryPicture = document.querySelector("#diaryPicture");
        diaryPicture.src = `${data.data.basicInfo.main_image}`;
        let diaryDate = document.querySelector("#diaryDate");
        diaryDate.innerHTML = `${data.data.basicInfo.date}`;
        let firstDate = data.progressInfo.firstDiaryDate;
        let lastDate = data.data.basicInfo.date;
        //計算progress總天數
        let progressDays = function (firstDate, lastDate) { 
          let date, date1, date2, days;
          date = firstDate.split("/")
          date1 = new Date(date[1] + '/' + date[2] + '/' + date[0]); // 轉換為 06/18/2016 格式
          date = lastDate.split("/")
          date2 = new Date(date[1] + '/' + date[2] + '/' + date[0]);
          days = parseInt(Math.abs(date1 - date2) / 1000 / 60 / 60 / 24); // 把相差的毫秒數轉換為天數
          return days;
        };
        let totalDays = progressDays(firstDate, lastDate);
        let diaryDay = document.querySelector("#diaryDay");
        diaryDay.innerHTML = `${totalDays}</br>Days`;
        let mood = document.querySelector("#mood");
        switch (data.data.basicInfo.mood) {
          case "0":
            mood.innerHTML = "";
            break;
          case "1":
            mood.innerHTML = `心情：&#129326 我是誰 我在哪裡 我在幹嘛`;
            break;
          case "2":
            mood.innerHTML = `心情：&#128532 好難ＲＲＲ 覺得自己有點廢`;
            break;
          case "3":
            mood.innerHTML = `心情： &#128531 雖然有點吃力 但還是完成了`;
            break;
          case "4":
            mood.innerHTML = `心情： &#128524 不再感到吃力 有成就感`;
            break;
          case "5":
            mood.innerHTML = `心情： &#128556 哎喔 慢慢找到感覺了喔`;
            break;
          case "6":
            mood.innerHTML = `心情： &#128538 得心應手 難不倒我`;
            break;
          case "7":
            mood.innerHTML = `心情： &#128548 輕輕鬆鬆 只用一根手指頭`;
            break;
        };
        for (let i in data.data.inputData) {
          let datarow = document.querySelector("#data");
          let dataDiv = document.createElement("div");
          dataDiv.className = "col-4 text-center"
          let dataValue = document.createElement("h4");
          dataValue.innerHTML = `${data.data.inputData[i].name}:${data.data.inputData[i].value}${data.data.inputData[i].unit}`;
          dataValue.id = "dataValue";
          dataDiv.appendChild(dataValue);
          datarow.appendChild(dataDiv);
        }
        let diaryContent = document.querySelector("#diaryContent");
        diaryContent.innerHTML = data.data.basicInfo.content;
        let diaryImages = document.querySelector("#diaryImages");
        for (let k in data.data.images) {
          let imageDiv = document.createElement("div");
          imageDiv.className = "col-3 diaryImage";
          let diaryImage = document.createElement("img");
          diaryImage.src = `${data.data.images[k].path}`;
          imageDiv.appendChild(diaryImage);
          diaryImages.appendChild(imageDiv);
        }
      }
    });
}