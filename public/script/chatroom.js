
let token = localStorage.getItem("token");
let myID;
let myName;
let myPic;
let myPicURL;
let NowAtRoomID;
let socketID;
let order =0;
const urlParams = new URLSearchParams(window.location.search);
const roomID = urlParams.get("roomid");
console.log(roomID);
let rightSide = document.querySelector("#rightSide");
let noRoomSelected = document.querySelector("#noRoomSelected");


if (!roomID) {
  rightSide.style.display = "none";
  noRoomSelected.style.display = "inline";
} 





const socket = io({
  auth: {
  token
}
});


socket.on('connect', () => {
  // 講整段code放入此處 表示連線後才能執行
  socketID = socket.id;
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
  myPic = userInfo.photo;
  myPicURL = userInfo.photoURL;
  //localStorage只能存string
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  // var cat = localStorage.getItem('userInfo');
  // console.log(JSON.parse(cat).name);
});



socket.on("roomList", roomList => {
  console.log(roomList);
  let friendul = document.querySelector("#friendul");
  for (let k in roomList) {
    let frinedLi = document.createElement("li");
    let link = document.createElement('a');
    frinedLi.setAttribute("onclick", `getMsg('${roomList[k].room_id}')`);
    frinedLi.id = `room${roomList[k].room_id}`;
    let friendID = roomList[k].sourceID;
    link.href = `#`;
    link.className = "clearfix";
    frinedLi.appendChild(link);
    let friendImg = document.createElement("img");
    if (roomList[k].image == "") {
      for (let p in roomList[k].member) {
        // console.log(roomList[k].member[p])
        if (roomList[k].member[p].name !== myName) {
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
        } 
      }
    } else {
      Name.innerHTML = roomList[k].name;
    }  
    link.appendChild(Name);
    let msgDiv = document.createElement("div");
    msgDiv.className = "last-message text-muted";
    msgDiv.id = `room${roomList[k].room_id}Msg`;
    msgDiv.innerHTML = roomList[k].latestMsg;
    link.appendChild(msgDiv);
    let time = document.createElement("small");
    time.className = "time text-muted";
    time.id = `room${roomList[k].room_id}Time`
    time.innerHTML = roomList[k].latestTime;
    link.appendChild(time);
    if (roomList[k].unReadMsgNum > 0) {
      let unRead = document.createElement("small");
      unRead.id = `room${roomList[k].room_id}ReadStatus`;
      unRead.className = "chat-alert label label-danger text-center unreadNum";
      if (roomList[k].unReadMsgNum > 10) {
        unRead.innerHTML = '10+';
      } else {
        unRead.innerHTML = roomList[k].unReadMsgNum;
      }
      link.appendChild(unRead);
    } else if (parseInt(roomList[k].sourceID) == myID) {
      let replayStatus = document.createElement("small");
      replayStatus.id = `room${roomList[k].room_id}ReadStatus`;
      replayStatus.className = 'chat-alert text-muted';
      let icon = document.createElement("i");
      icon.className = "fa fa-reply";
      replayStatus.appendChild(icon);
      link.appendChild(replayStatus);
    } else if (parseInt(roomList[k].sourceID) !== myID) {
      let replayStatus = document.createElement("small");
      replayStatus.id = `room${roomList[k].room_id}ReadStatus`;
      replayStatus.className = 'chat-alert text-muted';
      let icon = document.createElement("i");
      icon.className = "fa fa-check";
      replayStatus.appendChild(icon);
      link.appendChild(replayStatus);
    }
    friendul.appendChild(frinedLi);
  }
  
});
//跟server拿聊天室資料 
function getMsg (roomID) {
  NowAtRoomID = roomID;
  //拿聊天室訊息同時也要跟server更新最新的一則未讀;
  socket.emit("getRoomMsg", roomID);
  //更改未讀為已讀icon
  let readStatus = document.querySelector(`#room${roomID}ReadStatus`);
  //如果本來是已回覆就不改
  if (readStatus.innerHTML.length !== 27) {
    while (readStatus.firstChild) {
      readStatus.removeChild(readStatus.firstChild);
    }
    readStatus.className = 'chat-alert text-muted';
    let icon = document.createElement("i");
    icon.className = "fa fa-check";
    readStatus.appendChild(icon);
  }
  console.log(`get room ${roomID}`);
}
//從server拿回的聊天室資料
socket.on("getRoomMsg",data =>{
  console.log(data);
  let chatUl = document.querySelector('#chat');
  //同時畫面改為聊天室畫面
  rightSide.style.display = "inline";
  noRoomSelected.style.display = "none";
  while (chatUl.firstChild) {
    chatUl.removeChild(chatUl.firstChild);
  }
  NowAtRoomID = data.roomID;
  let msgArr = data.msg;
  for (let i in msgArr) {
    if (parseInt(msgArr[i].source_id) !== myID) {
      let msgLi = document.createElement("li");
      msgLi.className = "left clearfix";
      chatUl.appendChild(msgLi);
      let sourceImgSpan = document.createElement("span");
      sourceImgSpan.className = "chat-img pull-left";
      msgLi.appendChild(sourceImgSpan);
      let sourceImg = document.createElement("img");
      sourceImg.className = "sourceImg";
      sourceImg.src = msgArr[i].source_pic;
      sourceImg.alt = alt="User Avatar";
      sourceImgSpan.appendChild(sourceImg);
      let chatBodyDiv = document.createElement("div");
      chatBodyDiv.className = "chat-body clearfix";
      msgLi.appendChild(chatBodyDiv);
      let headerDiv = document.createElement("div");
      headerDiv.className = "header";
      chatBodyDiv.appendChild(headerDiv);
      let sourceName = document.createElement("strong");
      sourceName.className = "primary-font";
      sourceName.innerHTML = msgArr[i].source_name;
      headerDiv.appendChild(sourceName);
      let time = document.createElement("small");
      time.className = "pull-right text-muted";
      time.innerHTML = msgArr[i].time;
      headerDiv.appendChild(time);
      let text = document.createElement("p");
      text.innerHTML = msgArr[i].msg;
      chatBodyDiv.appendChild(text);
    } else {
      let msgLi = document.createElement("li");
      msgLi.className = "right clearfix";
      chatUl.appendChild(msgLi);
      let sourceImgSpan = document.createElement("span");
      sourceImgSpan.className = "chat-img pull-right";
      msgLi.appendChild(sourceImgSpan);
      let sourceImg = document.createElement("img");
      sourceImg.className = "sourceImg";
      sourceImg.src = msgArr[i].source_pic;
      sourceImg.alt = alt="User Avatar";
      sourceImgSpan.appendChild(sourceImg);
      let chatBodyDiv = document.createElement("div");
      chatBodyDiv.className = "chat-body clearfix";
      msgLi.appendChild(chatBodyDiv);
      let headerDiv = document.createElement("div");
      headerDiv.className = "header";
      chatBodyDiv.appendChild(headerDiv);
      let sourceName = document.createElement("strong");
      sourceName.className = "primary-font";
      sourceName.innerHTML = msgArr[i].source_name;
      headerDiv.appendChild(sourceName);
      let time = document.createElement("small");
      time.className = "pull-right text-muted";
      time.innerHTML = msgArr[i].time;
      headerDiv.appendChild(time);  
      let text = document.createElement("p");
      text.innerHTML = msgArr[i].msg;
      chatBodyDiv.appendChild(text);
    }
  }
});

//sendMsg
function sendMsg () {
  let currentTime = new Date().toLocaleString();
  let msg = document.querySelector("#msgInput");
  console.log("sendMsg");
  if (msg.value) {
    let msgInfo = {
      socket_id: socketID,
      room_id: NowAtRoomID,
      source_id: myID,
      source_name: myName,
      source_pic: myPic,
      msg: msg.value,
      time: currentTime
    }
    //送出的同時也要update最後一則已讀訊息
    socket.emit("sendMsg", msgInfo);
    //append自己sendMsg的對話匡到聊天室
    let chatUl = document.querySelector('#chat');
    let msgLi = document.createElement("li");
    msgLi.className = "right clearfix";
    chatUl.appendChild(msgLi);
    let sourceImgSpan = document.createElement("span");
    sourceImgSpan.className = "chat-img pull-right";
    msgLi.appendChild(sourceImgSpan);
    let sourceImg = document.createElement("img");
    sourceImg.className = "sourceImg";
    sourceImg.src = myPicURL;
    sourceImg.alt = alt="User Avatar";
    sourceImgSpan.appendChild(sourceImg);
    let chatBodyDiv = document.createElement("div");
    chatBodyDiv.className = "chat-body clearfix";
    msgLi.appendChild(chatBodyDiv);
    let headerDiv = document.createElement("div");
    headerDiv.className = "header";
    chatBodyDiv.appendChild(headerDiv);
    let sourceName = document.createElement("strong");
    sourceName.className = "primary-font";
    sourceName.innerHTML = myName;
    headerDiv.appendChild(sourceName);
    let time = document.createElement("small");
    time.className = "pull-right text-muted";
    time.innerHTML = currentTime;
    headerDiv.appendChild(time);  
    let text = document.createElement("p");
    text.innerHTML = msg.value;
    chatBodyDiv.appendChild(text);
    //更改聊天室的最新時間和訊息
    let lastMsg = document.querySelector(`#room${NowAtRoomID}Msg`);
    let lastTime = document.querySelector(`#room${NowAtRoomID}Time`);
    lastMsg.innerHTML = msg.value;
    lastTime.innerHTML = currentTime;
    //要把當前的聊天室移到列表的第一個;(前提是這個聊天室本來就在聊天列表，如果沒有就要創一個新的(表示這兩個人之前沒有聊過天))
    let roomLi = document.querySelector(`#room${NowAtRoomID}`);
    if (roomLi) {
      roomLi.style.order = order-1;
      order -= 1;
      //更改已讀狀態為已回覆
      let readStatus = document.querySelector(`#room${NowAtRoomID}ReadStatus`);
      while (readStatus.firstChild) {
        readStatus.removeChild(readStatus.firstChild);
      }
      readStatus.className = 'chat-alert text-muted';
      let icon = document.createElement("i");
      icon.className = "fa fa-reply";
      readStatus.appendChild(icon);
    }
    msg.value = '';
  }


}
//收到傳來聊天室的新訊息
socket.on("newMsg", msgInfo => {
  console.log(msgInfo);
  console.log("here");
  let chatUl = document.querySelector('#chat');
  // 如果在該房間要及時append訊息
  //不在該房間就不用，因為他點進去那個房間就會render最新訊息
  if (msgInfo.room_id == NowAtRoomID) {
    let msgLi = document.createElement("li");
    msgLi.className = "left clearfix";
    chatUl.appendChild(msgLi);
    let sourceImgSpan = document.createElement("span");
    sourceImgSpan.className = "chat-img pull-left";
    msgLi.appendChild(sourceImgSpan);
    let sourceImg = document.createElement("img");
    sourceImg.className = "sourceImg";
    sourceImg.src = msgInfo.source_pic;
    sourceImg.alt = alt="User Avatar";
    sourceImgSpan.appendChild(sourceImg);
    let chatBodyDiv = document.createElement("div");
    chatBodyDiv.className = "chat-body clearfix";
    msgLi.appendChild(chatBodyDiv);
    let headerDiv = document.createElement("div");
    headerDiv.className = "header";
    chatBodyDiv.appendChild(headerDiv);
    let sourceName = document.createElement("strong");
    sourceName.className = "primary-font";
    sourceName.innerHTML = msgInfo.source_name;
    headerDiv.appendChild(sourceName);
    let time = document.createElement("small");
    time.className = "pull-right text-muted";
    time.innerHTML = msgInfo.time;
    headerDiv.appendChild(time);  
    let text = document.createElement("p");
    text.innerHTML = msgInfo.msg;
    chatBodyDiv.appendChild(text);
  }
  //把該訊息聊天室移到列表的第一個(前提是這個聊天室本來就在聊天列表，如果沒有就要創一個新的(表示這兩個人之前沒有聊過天))
  let roomLi = document.querySelector(`#room${msgInfo.room_id}`);
  if (roomLi) {
    //更改聊天室的最新時間和訊息
    let lastMsg = document.querySelector(`#room${msgInfo.room_id}Msg`);
    let lastTime = document.querySelector(`#room${msgInfo.room_id}Time`);
    lastMsg.innerHTML = msgInfo.msg;
    lastTime.innerHTML = msgInfo.time;
    console.log("here to change order");
    roomLi.style.order = order-1;
    order -= 1;
    //判斷有沒有開著該聊天室
    //如果在該聊天室,icon變成已讀
    if (msgInfo.room_id == NowAtRoomID) {
      let readStatus = document.querySelector(`#room${NowAtRoomID}ReadStatus`);
      while (readStatus.firstChild) {
        readStatus.removeChild(readStatus.firstChild);
      }
      readStatus.className = 'chat-alert text-muted';
      let icon = document.createElement("i");
      icon.className = "fa fa-check";
      readStatus.appendChild(icon);
    } else {
      //如果沒有,icon如果有未讀數字，要變成未讀數字＋1，沒有未讀數字的話，直接變成一則未讀
      let readStatus = document.querySelector(`#room${msgInfo.room_id}ReadStatus`);
      if (readStatus.innerHTML.length <= 3) {
        //還要看有沒有超過10則未讀
        if (parseInt(readStatus.innerHTML)+1 > 10) {
          readStatus.innerHTML = '10+';
        } else {
          readStatus.innerHTML = parseInt(readStatus.innerHTML)+1;
        }
      } else {
        //本來是已讀或已回覆要改成有新訊息
        while (readStatus.firstChild) {
          readStatus.removeChild(readStatus.firstChild);
        }
        readStatus.className = "chat-alert label label-danger text-center unreadNum";
        readStatus.innerHTML = 1;
      }
    }
  }

})
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