// Get API query parameter
let token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const groupProgressID = urlParams.get("id");
console.log(groupProgressID);
let invationCode;
getGroupData ();

//今天日期
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
console.log(today);

let diaryVerb;
let diaryUnit;
function getGroupData () {
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
      } else if (response.status === 405) {
        //告訴他他不是會員
        Swal.fire({
          title: '請輸入邀請碼',
          text: '您還不是該群組的成員喔!',
          width: '400px',
          imageUrl: 'https://i.imgur.com/yptcZAT.png',
          imageWidth: 350,
          imageHeight: 233,
          showCancelButton: true,
          confirmButtonColor: '#132235',
          cancelButtonColor: '#6ddad3',
          confirmButtonText: '確定',
          cancelButtonText:'取消',
          html:
            `<input type="text" id="invitationCodeinput" name="invitationCodeinput" class="swal2-input">`
        }).then (result => {
          let invitationCode = document.querySelector("#invitationCodeinput").value;
          if (result.value && invitationCode.value !== "") {
            let data = {
              invitationCode
            }
            fetch('/checkInvitation', {
              method: 'POST',
              body: JSON.stringify(data),
              headers: { 'authorization': `Bearer ${token}`,
                      'content-type': 'application/json'},
            })
            .then(response =>{
              if (response.status === 200) {
                return response.json();
              } else if (response.status === 403) {
                console.log("請輸入正確邀請碼");
                Swal.fire(
                  {
                    title:"請輸入正確邀請碼",
                    icon:"error",
                    confirmButtonColor: '#132235',
                    confirmButtonText: 'OK',
                  }
                );
              }
            })
            .then(data =>{
              // suppose會是groupprogress id
              if(data) {
                console.log("join.....")
                console.log(data);
                Swal.fire(
                  {
                    title:"加入成功",
                    text: "將進入群組 Progress",
                    icon:"success",
                    confirmButtonColor: '#132235',
                    confirmButtonText: 'OK',
                  }
                );
                setTimeout(function(){ window.location.assign(`/groupProgress?id=${data.groupProgressID}`); }, 2000);
              }
            });
          } else {
            window.history.go(-1);
          }
        });
      }
    })
    .then (data => {
      if (data) {
        console.log(data);
        invationCode = data.basicInfo.invitation_code;
        //title part
        let progressName = document.querySelector("#progressName");
        progressName.innerHTML = data.basicInfo.name;
        let progressMotivation = document.querySelector("#progressMotivation");
        progressMotivation.innerHTML = data.basicInfo.motivation;
        let category = document.querySelector('#category');
        category.innerHTML = `類別: ${data.basicInfo.category}`;
        let startDate = document.querySelector('#startDate');
        startDate.innerHTML = `開始日期: ${data.basicInfo.start_date}`;
        let endDate = document.querySelector('#endDate');
        let groupDay= document.querySelector("#groupDay");
        let diaryPicture = document.querySelector('#diaryPicture');
        diaryPicture.src = data.basicInfo.picture;
        let motivation = document.querySelector('#motivation');
        motivation.innerHTML = `目標: ${data.basicInfo.goal_verb} ${data.basicInfo.goal_num} ${data.basicInfo.goal_unit}`;
        let chatRoom = document.querySelector("#chatroom");
        chatRoom.href = `/chatroom.html?roomid=${data.basicInfo.room_id}`;
        let editLink = document.querySelector('#editLink');
        editLink.href = `/editGroupProgress?id=${groupProgressID}`;
        if (data.basicInfo.end_date == "") {
          console.log("here");
          endDate.style.display = "none";
          let firstDate = data.basicInfo.start_date;
          let lastDate = today;
          let totalDays = progressDays(firstDate, lastDate);
          console.log(totalDays);
          if (firstDate > lastDate) {
            groupDay.innerHTML = `Begins In</br>${totalDays}</br>Days`;
            let personalProgressRow =document.querySelector("#personalProgressRow");
            personalProgressRow.style.display = "none";
            let memberProgressBars =document.querySelector("#memberProgressBars");
            memberProgressBars.style.display = "none";
            //背景圖display出來
          } else {
            let finishedCount = 0;
            for (let k in data.members) {
              if (data.members[k].percent == 100) {
                finishedCount += 1;
              }
            }
            //如果大家都100％
            console.log(finishedCount);
            if (finishedCount == data.members.length) {
              groupDay.innerHTML = `Finished!`;
              let todayDate = document.querySelector("#todayDate");
              let dataTodayDiv = document.querySelector("#dataTodayDiv");
              let saveBtnDiv = document.querySelector("#saveBtnDiv");
              todayDate.style.display = "none";
              dataTodayDiv.style.display = "none";
              saveBtnDiv.style.display = "none";
            } else {
              groupDay.innerHTML = `Start</br>${totalDays}</br>Days`;
            }
          }
        } else {
          endDate.innerHTML = `結束日期: ${data.basicInfo.end_date}`;
          //已經結束
          if (today > data.basicInfo.end_date) {
            groupDay.innerHTML = `Finished!`;
              let todayDate = document.querySelector("#todayDate");
              let dataTodayDiv = document.querySelector("#dataTodayDiv");
              let saveBtnDiv = document.querySelector("#saveBtnDiv");
              todayDate.style.display = "none";
              dataTodayDiv.style.display = "none";
              saveBtnDiv.style.display = "none";
          } else {
            let firstDate = today;
            let lastDate = data.basicInfo.end_date;
            let totalDays = progressDays(firstDate, lastDate);
            groupDay.innerHTML = `${totalDays}</br>Days</br>TO GO`;
          }
        }
        //memberList
        if (data.members.length == 8) {
          let addMemberBtn = document.querySelector("#addMember");
          addMemberBtn.style.display = "none";
        }
        for (let k in data.members) {
          //加入成員list
          let memberRaw = document.querySelector("#memberRaw");
          let itemDiv = document.createElement('div');
          itemDiv.className = "item";
          let imgLink = document.createElement('a');
          imgLink.href = `myProgress?userid=${data.members[k].id}`;
          itemDiv.appendChild(imgLink);
          let memberImg = document.createElement("img");
          memberImg.src = data.members[k].photo;
          imgLink.appendChild(memberImg);
          let nameDiv = document.createElement('div');
          nameDiv.className = "text-center";
          itemDiv.appendChild(nameDiv);
          let name = document.createElement('p');
          name.innerHTML = data.members[k].name;
          nameDiv.appendChild(name);
          memberRaw.appendChild(itemDiv);
          //加入ProressBar
          //自己的progreeBar
          if (data.members[k].id == myID) {
            let myProgressBar = document.querySelector("#myProgressBar");
            let myProgressBarDiv = document.createElement("div");
            myProgressBarDiv.className = 'progress-bar progress-bar-striped';
            myProgressBarDiv.setAttribute('role', 'progressbar');
            myProgressBarDiv.style.width = `${data.members[k].percent}%`;
            myProgressBarDiv.setAttribute('aria-valuenow', `${data.members[k].percent}`);
            myProgressBarDiv.setAttribute('aria-valuemin', '0');
            myProgressBarDiv.setAttribute('aria-valuemax', '100');
            myProgressBar.appendChild(myProgressBarDiv);
            let myProgreePercent = document.querySelector("#myProgreePercent");
            myProgreePercent.innerHTML = `${data.members[k].percent}%`;
          }
          let memberProgressBars = document.querySelector('#memberProgressBars');
          let memberProgressBarDiv = document.createElement('div');
          memberProgressBarDiv.className = "row align-items-center memberProgressBar";
          memberProgressBars.appendChild(memberProgressBarDiv);
          let rankDiv = document.createElement("div");
          rankDiv.className = 'rankNum text-center';
          let rankNum = parseInt(k)+1;
          rankDiv.innerHTML = `${rankNum}.`;
          memberProgressBarDiv.appendChild(rankDiv);
          let memberNameDiv = document.createElement("div");
          memberNameDiv.className = "memberName text-center";
          memberNameDiv.innerHTML = data.members[k].name;
          memberProgressBarDiv.appendChild(memberNameDiv);

          let memberPercnetDiv = document.createElement("div");
          memberPercnetDiv.className = "memberPercnet text-center";
          memberPercnetDiv.innerHTML = `${data.members[k].percent}%`;
          memberProgressBarDiv.appendChild(memberPercnetDiv);
          let col9Div = document.createElement("div");
          col9Div.className = "col-9";
          memberProgressBarDiv.appendChild(col9Div);
          let progressDiv = document.createElement("div");
          progressDiv.className = "progress";
          col9Div.appendChild(progressDiv);
          let progressBarDiv = document.createElement('div');
          progressBarDiv.className = "progress-bar progress-bar-striped";
          progressBarDiv.setAttribute('role', 'progressbar');
          progressBarDiv.style.width = `${data.members[k].percent}%`;
          progressBarDiv.setAttribute('aria-valuenow', `${data.members[k].percent}`);
          progressBarDiv.setAttribute('aria-valuemin', '0');
          progressBarDiv.setAttribute('aria-valuemax', '100');
          progressDiv.appendChild(progressBarDiv);
        }
        let dataVerb = document.querySelector('#dataVerb');
        let dataUnit = document.querySelector('#dataUnit');
        let todayDate = document.querySelector('#todayDate');
        dataVerb.innerHTML = data.basicInfo.goal_verb;
        dataUnit.innerHTML = data.basicInfo.goal_unit;
        todayDate.innerHTML = today;
        diaryVerb = data.basicInfo.goal_verb;
        diaryUnit = data.basicInfo.goal_unit;
        //自己的日記和數據
        let mytotalProgress = document.querySelector("#mytotalProgress");
        console.log(data.personalSum);
        if (data.personalSum == null) {
          data.personalSum = 0;
        }
        mytotalProgress.innerHTML = `共${data.basicInfo.goal_verb} ${data.personalSum} ${data.basicInfo.goal_unit}`
        let left = parseInt(data.basicInfo.goal_num)-parseInt(data.personalSum);
        let myleft = document.querySelector('#myleft');
        myleft.innerHTML = `還差目標 ${left} ${data.basicInfo.goal_unit}`;
        let historyList = document.querySelector('#historyList');
        for (let j in data.personalDiary) {
          let diaryDiv = document.createElement('div');
          diaryDiv.className = "text-center diary";
          diaryDiv.innerHTML = `${data.personalDiary[j].date} ${data.basicInfo.goal_verb} ${data.personalDiary[j].data_num} ${data.basicInfo.goal_unit}`;
          historyList.appendChild(diaryDiv);
        }
        
        
      } 
    });
}




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



function showCode() {
  Swal.fire({
    title: `複製邀請碼給朋友吧`,
    text:  `${invationCode}`,
    imageUrl: 'https://i.imgur.com/yptcZAT.png',
    imageWidth: 350,
    imageHeight: 233,
    animation: false
  });
}

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

function insertMydiary() {
  let dataToday = document.querySelector("#dataToday").value;
  console.log(dataToday);
  let data = {
    group_progress_id: groupProgressID,
    user_id: myID,
    data_verb: diaryVerb,
    data_num: dataToday,
    data_unit: diaryUnit,
    date: today
  }
  console.log(data);
  fetch(`/groupProgress/personalData?id=${groupProgressID}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'authorization': `Bearer ${token}`,
                'content-type': 'application/json'},
  })
  .then(function (response) {
    if (response.status === 200) {
      Swal.fire(
        {
          title:"新增今日日記成功",
          icon:"success",
          confirmButtonColor: '#132235',
          confirmButtonText: 'OK',
        }
      ).then(()=>{
        window.location.assign(`/groupProgress?id=${groupProgressID}`);
      })
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign('/signin.html');
    } else if (response.status === 403) {
      alert("登入逾期，請重新登入");
      return window.location.assign('/signin.html');
    }
  })
}

function search () {
  let keyword = document.querySelector('#search').value;
  if (keyword !== '') {
    window.location.assign(`/category.html?keyword=${keyword}`);
  } 
}