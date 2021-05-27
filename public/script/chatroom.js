
let token = localStorage.getItem("token");
let myID;
let myName;
const urlParams = new URLSearchParams(window.location.search);
const roomID = urlParams.get("roomid");
console.log(roomID);

if (!roomID) {
  let rightSide = document.querySelector("#rightSide");
  rightSide.style.display = "none";
  let noRoomSelected = document.querySelector("#noRoomSelected");
  noRoomSelected.style.display = "inline";
} 





const socket = io({
  auth: {
  token
}
});

socket.on('connect', () => {
  // 講整段code放入此處 表示連線後才能執行
  console.log(socket.id);
  // socket.emit(“in room”, “test”); // 按按鈕才會送出！？
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
  //localStorage只能存string
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  // var cat = localStorage.getItem('userInfo');
  // console.log(JSON.parse(cat).name);
});



socket.on("roomList", roomList => {
  console.log("roomlist");
  console.log(roomList);
  let friendul = document.querySelector("#friendul");
  console.log(friendul);
  for (let k in roomList) {
    let frinedLi = document.createElement("li");
    let link = document.createElement('a');
    frinedLi.setAttribute("onclick", `getMsg('${roomList[k].room_id}')`);
    let friendID = roomList[k].sourceID;
    link.href = `#`;
    link.className = "clearfix";
    frinedLi.appendChild(link);
    let friendImg = document.createElement("img");
    if (roomList[k].image == "") {
      console.log(roomList[k].room_id)
      for (let p in roomList[k].member) {
        // console.log(roomList[k].member[p])
        if (roomList[k].member[p].name !== myName) {
          friendImg.src= roomList[k].member[p].photo;
        } else {
          friendImg.src= roomList[k].member[p].photo;
        }
      }
    } else {
      friendImg.src=roomList[k].image;
    }
    friendImg.className = "img-circle friendImg";
    link.appendChild(friendImg);
    let NameDiv = document.createElement("div");
    NameDiv.className = "friend-name";
    let Name = document.createElement("strong");
    if (roomList[k].name == "") {
      for (let j in roomList[k].member) {
        if (roomList[k].member[j].name !== myName) {
          Name.innerHTML = roomList[k].member[j].name;
        } else {
          Name.innerHTML = roomList[k].member[j].name;
        }
      }
    } else {
      Name.innerHTML = roomList[k].name;
    }  
    link.appendChild(Name);
    let msgDiv = document.createElement("div");
    msgDiv.className = "last-message text-muted";
    msgDiv.innerHTML = roomList[k].latestMsg;
    link.appendChild(msgDiv);
    let time = document.createElement("small");
    time.className = "time text-muted";
    time.innerHTML = roomList[k].latestTime;
    link.appendChild(time);
    if (roomList[k].unReadMsgNum > 0) {
      let unRead = document.createElement("small");
      unRead.className = "chat-alert label label-danger text-center unreadNum";
      unRead.innerHTML = roomList[k].unReadMsgNum;
      link.appendChild(unRead);
    } else if (parseInt(roomList[k].sourceID) == myID) {
      let replayStatus = document.createElement("small");
      replayStatus.className = 'chat-alert text-muted';
      let icon = document.createElement("i");
      icon.className = "fa fa-reply";
      replayStatus.appendChild(icon);
      link.appendChild(replayStatus);
    } else if (parseInt(roomList[k].sourceID) !== myID) {
      let replayStatus = document.createElement("small");
      replayStatus.className = 'chat-alert text-muted';
      let icon = document.createElement("i");
      icon.className = "fa fa-check";
      replayStatus.appendChild(icon);
      link.appendChild(replayStatus);
    }
    friendul.appendChild(frinedLi);
  }
  
});
//拿聊天室資料
function getMsg (roomID) {
  console.log(`get room ${roomID}`);
  socket.emit("getRoomMsg", roomID);
  
}


// let paging=0;
// let friendList = document.querySelector("#friend-list");
// // console.log(friendList.offsetHeight);
// if (paging == 0) {
//   console.log("no scroll");
//   socket.emit("paging", paging);
// }
// console.log(friendList.offsetHeight);
// console.log(friendList.scrollTop);
// console.log(friendList.innerHeight);
// var style = window.getComputedStyle(document.getElementById("friendList"), null);
// let height = parseInt(style.getPropertyValue("height"));
// console.log(height);
// friendList.onscroll = function () {
//   console.log("scroll");
//   // socket.emit("paging", paging);
//   console.log(friendList.offsetHeight);
//   console.log(friendList.scrollTop);
//   if ((friendList.innerHeight + friendList.scrollTop) >= friendList.offsetHeight) {
//         paging += 1;
//         console.log("plus paging");
//       }
//   console.log(paging);
// };


// let time = new Date().toLocaleString();
// console.log(time);


// var form = document.getElementById('form');
// var input = document.getElementById('input');

// form.addEventListener('submit', function(e) {
// e.preventDefault();
// let time = new Date().toLocaleString();
// if (input.value) {
//   socket.emit('chat message', {
//     id: socket.id,
//     content: input.value,
//     time
//   });
//   input.value = '';
// }
// });





// socket.on('chat message', function(msg) {
//   var item = document.createElement('li');
//   item.textContent = msg;
//   messages.appendChild(item);
//   window.scrollTo(0, document.body.scrollHeight);
// });

// window.onscroll = function () {
//   if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
//     paging += 1;
//     productAJAX(paging);
//   }
// };