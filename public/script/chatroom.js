
// 一進聊天室就要改變訊息讀取狀態！都改成沒有未讀訊息
const token = localStorage.getItem("token");
let myID;
let myName;
let myPic;
let myPicURL;
let NowAtRoomID;
let socketID;
let order = 0;
let newRoomUserName;
let newRoomUserPic;
const urlParams = new URLSearchParams(window.location.search);
const roomID = urlParams.get("roomid");
const user1ID = urlParams.get("user1id");
const user2ID = urlParams.get("user2id");
const rightSide = document.querySelector("#rightSide");
const noRoomSelected = document.querySelector("#noRoomSelected");

const socket = io({
  auth: {
    token
  }
});

if (!roomID) {
  rightSide.style.display = "none";
  noRoomSelected.style.display = "inline";
} else if (roomID == "no") {
  // 生成房間ＲＲＲＲ
  // 避免重新生成要再socket一次確保兩個人沒有shareroom
  const users = [user1ID, user2ID];
  socket.emit("checkShareRoom", users);
} else if (roomID !== "no") {
  NowAtRoomID = roomID;
  // fetch聊天室middleware
  fetch(`/api/1.0/roomMember?roomid=${roomID}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    }
  }).then(response => {
    if (response.status === 200) {
      // 拿聊天室訊息同時也要跟server更新最新的一則未讀;
      socket.emit("getRoomMsg", roomID);
    } else if (response.status === 401) {
      Swal.fire(
        {
          title: "請先登入",
          icon: "warning",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    } else if (response.status === 403) {
      Swal.fire(
        {
          title: "登入逾期或無權限",
          icon: "error",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    }
  });
}

socket.on("checkShareRoomResult", shareRoom => {
  if (shareRoom == "no") {
    const users = [user1ID, user2ID];
    socket.emit("createRoom", users);
  }
});
socket.on("connect", () => {
  socketID = socket.id;
});

socket.on("connect_error", (err) => {
  console.log(err.message);
  if (err.message) {
    alert(err.message);
    return window.location.assign("/signin");
  }
});

setTimeout(function () { socket.emit("inTheChatRoom", "true"); }, 2000);

socket.on("newRoomInfo", newRoomInfo => {
  for (const i in newRoomInfo.memberInfo) {
    if (newRoomInfo.memberInfo[i].user !== myID) {
      newRoomUserName = newRoomInfo.memberInfo[i].name;
      newRoomUserPic = newRoomInfo.memberInfo[i].photo;
    }
  }
  NowAtRoomID = newRoomInfo.newRoomID;
});
// 看新創的room有沒有自己,有的話告訴server把我加進去
socket.on("newRoomInvitation", data => {
  const { memberArr } = data;
  const memberIntArr = [];
  for (const i in memberArr) {
    memberIntArr.push(parseInt(memberArr[i]));
  }
  if (memberIntArr.indexOf(myID) !== -1) {
    socket.emit("letMeJoinRoom", data.newRoomID);
  }
});

socket.on("userInfo", (userInfo) => {
  myID = userInfo.id;
  myName = userInfo.name;
  myPic = userInfo.photo;
  myPicURL = userInfo.photoURL;
  // localStorage只能存string
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
});

socket.on("roomList", roomList => {
  if (roomList.length == 0) {
    Swal.fire({
      title: "您尚未任何人聊天",
      text: "試試看搜尋朋友並私訊他吧！",
      imageUrl: "https://i.imgur.com/FBCjmH4.jpg",
      imageWidth: 400,
      imageHeight: 233,
      animation: false
    });
  } else {
    const demo = document.getElementsByClassName("demo");
    for (let i = 0; i < demo.length; i++) {
      demo[i].style.display = "none";
    }
  }
  const friendul = document.querySelector("#friendul");
  for (const k in roomList) {
    const frinedLi = document.createElement("li");
    const link = document.createElement("a");
    frinedLi.setAttribute("onclick", `getMsg('${roomList[k].room_id}')`);
    frinedLi.id = `room${roomList[k].room_id}`;
    const friendID = roomList[k].sourceID;
    link.href = "#";
    link.className = "clearfix";
    frinedLi.appendChild(link);
    const friendImg = document.createElement("img");
    if (roomList[k].image == "") {
      for (const p in roomList[k].member) {
        if (parseInt(roomList[k].member[p].user) !== myID) {
          friendImg.src = roomList[k].member[p].photo;
        }
      }
    } else {
      friendImg.src = roomList[k].image;
    }
    friendImg.className = "img-circle friendImg";
    link.appendChild(friendImg);
    const NameDiv = document.createElement("div");
    NameDiv.className = "friend-name";
    const Name = document.createElement("strong");
    if (roomList[k].name == "") {
      for (const j in roomList[k].member) {
        if (parseInt(roomList[k].member[j].user) !== myID) {
          Name.innerHTML = roomList[k].member[j].name;
        }
      }
    } else {
      Name.innerHTML = roomList[k].name;
    }
    link.appendChild(Name);
    const msgDiv = document.createElement("div");
    msgDiv.className = "last-message text-muted";
    msgDiv.id = `room${roomList[k].room_id}Msg`;
    msgDiv.innerHTML = roomList[k].latestMsg;
    link.appendChild(msgDiv);
    const time = document.createElement("small");
    time.className = "time text-muted";
    time.id = `room${roomList[k].room_id}Time`;
    time.innerHTML = roomList[k].latestTime;
    link.appendChild(time);
    if (roomList[k].unReadMsgNum > 0) {
      const unRead = document.createElement("small");
      unRead.id = `room${roomList[k].room_id}ReadStatus`;
      unRead.className = "chat-alert label label-danger text-center unreadNum";
      if (roomList[k].unReadMsgNum > 10) {
        unRead.innerHTML = "10+";
      } else {
        unRead.innerHTML = roomList[k].unReadMsgNum;
      }
      link.appendChild(unRead);
    } else if (parseInt(roomList[k].sourceID) == myID) {
      const replayStatus = document.createElement("small");
      replayStatus.id = `room${roomList[k].room_id}ReadStatus`;
      replayStatus.className = "chat-alert text-muted";
      const icon = document.createElement("i");
      icon.className = "fa fa-reply";
      replayStatus.appendChild(icon);
      link.appendChild(replayStatus);
    } else if (parseInt(roomList[k].sourceID) !== myID) {
      const replayStatus = document.createElement("small");
      replayStatus.id = `room${roomList[k].room_id}ReadStatus`;
      replayStatus.className = "chat-alert text-muted";
      const icon = document.createElement("i");
      icon.className = "fa fa-check";
      replayStatus.appendChild(icon);
      link.appendChild(replayStatus);
    }
    friendul.appendChild(frinedLi);
  }
});
// 跟server拿聊天室資料
function getMsg (roomID) {
  NowAtRoomID = roomID;
  // 拿聊天室訊息同時也要跟server更新最新的一則未讀;
  socket.emit("getRoomMsg", roomID);
  // 更改未讀為已讀icon
  const readStatus = document.querySelector(`#room${roomID}ReadStatus`);
  // 如果本來是已回覆就不改
  if (readStatus.innerHTML.length !== 27) {
    while (readStatus.firstChild) {
      readStatus.removeChild(readStatus.firstChild);
    }
    readStatus.className = "chat-alert text-muted";
    const icon = document.createElement("i");
    icon.className = "fa fa-check";
    readStatus.appendChild(icon);
  }
}
// 從server拿回的聊天室資料
socket.on("getRoomMsg", data => {
  const chatUl = document.querySelector("#chat");
  // 同時畫面改為聊天室畫面
  rightSide.style.display = "inline";
  noRoomSelected.style.display = "none";
  while (chatUl.firstChild) {
    chatUl.removeChild(chatUl.firstChild);
  }
  NowAtRoomID = data.roomID;
  const msgArr = data.msg;
  for (const i in msgArr) {
    if (parseInt(msgArr[i].source_id) !== myID) {
      const msgLi = document.createElement("li");
      msgLi.className = "left clearfix";
      chatUl.appendChild(msgLi);
      const sourceImgSpan = document.createElement("span");
      sourceImgSpan.className = "chat-img pull-left";
      msgLi.appendChild(sourceImgSpan);
      const sourceImg = document.createElement("img");
      sourceImg.className = "sourceImg";
      sourceImg.src = msgArr[i].photo;
      sourceImg.alt = alt = "User Avatar";
      sourceImgSpan.appendChild(sourceImg);
      const chatBodyDiv = document.createElement("div");
      chatBodyDiv.className = "chat-body clearfix";
      msgLi.appendChild(chatBodyDiv);
      const headerDiv = document.createElement("div");
      headerDiv.className = "header";
      chatBodyDiv.appendChild(headerDiv);
      const sourceName = document.createElement("strong");
      sourceName.className = "primary-font";
      sourceName.innerHTML = msgArr[i].name;
      headerDiv.appendChild(sourceName);
      const time = document.createElement("small");
      time.className = "pull-right text-muted";
      time.innerHTML = msgArr[i].time;
      headerDiv.appendChild(time);
      const text = document.createElement("p");
      text.innerHTML = msgArr[i].msg;
      chatBodyDiv.appendChild(text);
    } else {
      const msgLi = document.createElement("li");
      msgLi.className = "right clearfix";
      chatUl.appendChild(msgLi);
      const sourceImgSpan = document.createElement("span");
      sourceImgSpan.className = "chat-img pull-right";
      msgLi.appendChild(sourceImgSpan);
      const sourceImg = document.createElement("img");
      sourceImg.className = "sourceImg";
      sourceImg.src = msgArr[i].photo;
      sourceImg.alt = alt = "User Avatar";
      sourceImgSpan.appendChild(sourceImg);
      const chatBodyDiv = document.createElement("div");
      chatBodyDiv.className = "chat-body clearfix";
      msgLi.appendChild(chatBodyDiv);
      const headerDiv = document.createElement("div");
      headerDiv.className = "header";
      chatBodyDiv.appendChild(headerDiv);
      const sourceName = document.createElement("strong");
      sourceName.className = "primary-font";
      sourceName.innerHTML = msgArr[i].name;
      headerDiv.appendChild(sourceName);
      const time = document.createElement("small");
      time.className = "pull-right text-muted";
      time.innerHTML = msgArr[i].time;
      headerDiv.appendChild(time);
      const text = document.createElement("p");
      text.innerHTML = msgArr[i].msg;
      chatBodyDiv.appendChild(text);
    }
    const chatRoom = document.querySelector("#chat-message");
    chatRoom.scrollTo(0, chatRoom.scrollHeight);
  }
});

// sendMsg
// enter可以送訊息
const msgInput = document.querySelector("#msgInput");
msgInput.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    sendMsg();
  }
});
function sendMsg () {
  const currentTime = new Date().toLocaleString();
  const msg = document.querySelector("#msgInput");
  const msgValue = msg.value;
  if (msg.value) {
    // 要讓server知道要給誰
    const msgInfo = {
      socket_id: socketID,
      room_id: NowAtRoomID,
      source_id: myID,
      source_name: myName,
      source_pic: myPic,
      msg: msg.value,
      time: currentTime
    };
    // 送出的同時也要update最後一則已讀訊息
    socket.emit("sendMsg", msgInfo);
    // append自己sendMsg的對話匡到聊天室
    const chatUl = document.querySelector("#chat");
    const msgLi = document.createElement("li");
    msgLi.className = "right clearfix";
    chatUl.appendChild(msgLi);
    const sourceImgSpan = document.createElement("span");
    sourceImgSpan.className = "chat-img pull-right";
    msgLi.appendChild(sourceImgSpan);
    const sourceImg = document.createElement("img");
    sourceImg.className = "sourceImg";
    sourceImg.src = myPicURL;
    sourceImg.alt = alt = "User Avatar";
    sourceImgSpan.appendChild(sourceImg);
    const chatBodyDiv = document.createElement("div");
    chatBodyDiv.className = "chat-body clearfix";
    msgLi.appendChild(chatBodyDiv);
    const headerDiv = document.createElement("div");
    headerDiv.className = "header";
    chatBodyDiv.appendChild(headerDiv);
    const sourceName = document.createElement("strong");
    sourceName.className = "primary-font";
    sourceName.innerHTML = myName;
    headerDiv.appendChild(sourceName);
    const time = document.createElement("small");
    time.className = "pull-right text-muted";
    time.innerHTML = currentTime;
    headerDiv.appendChild(time);
    const text = document.createElement("p");
    text.innerHTML = msg.value;
    chatBodyDiv.appendChild(text);
    const chatRoom = document.querySelector("#chat-message");
    chatRoom.scrollTo(0, chatRoom.scrollHeight);
    // 要把當前的聊天室移到列表的第一個;(前提是這個聊天室本來就在聊天列表，如果沒有就要創一個新的(表示這兩個人之前沒有聊過天))
    const roomLi = document.querySelector(`#room${NowAtRoomID}`);
    if (roomLi) {
      // 更改聊天室的最新時間和訊息
      const lastMsg = document.querySelector(`#room${NowAtRoomID}Msg`);
      const lastTime = document.querySelector(`#room${NowAtRoomID}Time`);
      lastMsg.innerHTML = msg.value;
      lastTime.innerHTML = currentTime;
      roomLi.style.order = order - 1;
      order -= 1;
      // 更改已讀狀態為已回覆
      const readStatus = document.querySelector(`#room${NowAtRoomID}ReadStatus`);
      while (readStatus.firstChild) {
        readStatus.removeChild(readStatus.firstChild);
      }
      readStatus.className = "chat-alert text-muted";
      const icon = document.createElement("i");
      icon.className = "fa fa-reply";
      readStatus.appendChild(icon);
    } else {
      // 新的聊天室沒有roomLi要新創一個並且移到對頂端
      const friendul = document.querySelector("#friendul");
      const frinedLi = document.createElement("li");
      const link = document.createElement("a");
      frinedLi.setAttribute("onclick", `getMsg('${NowAtRoomID}')`);
      frinedLi.id = `room${NowAtRoomID}`;
      link.href = "#";
      link.className = "clearfix";
      frinedLi.appendChild(link);
      if (newRoomUserPic) {
        const friendImg = document.createElement("img");
        friendImg.src = newRoomUserPic;
        friendImg.className = "img-circle friendImg";
        link.appendChild(friendImg);
        const NameDiv = document.createElement("div");
        NameDiv.className = "friend-name";
        const Name = document.createElement("strong");
        Name.innerHTML = newRoomUserName;
        link.appendChild(Name);
        const msgDiv = document.createElement("div");
        msgDiv.className = "last-message text-muted";
        msgDiv.id = `room${NowAtRoomID}Msg`;
        msgDiv.innerHTML = msgValue;
        link.appendChild(msgDiv);
      } else {
        // 群組聊天室開場白
        fetch(`/api/1.0/selectGroupChat?id=${roomID}`, {
          method: "GET"
        }).then(response => {
          if (response.status === 200) {
            return response.json();
          }
        }).then(data => {
          if (data) {
            const friendImg = document.createElement("img");
            friendImg.src = data.image;
            friendImg.className = "img-circle friendImg";
            link.appendChild(friendImg);
            const NameDiv = document.createElement("div");
            NameDiv.className = "friend-name";
            const Name = document.createElement("strong");
            Name.innerHTML = data.name;
            link.appendChild(Name);
            const msgDiv = document.createElement("div");
            msgDiv.className = "last-message text-muted";
            msgDiv.id = `room${NowAtRoomID}Msg`;
            msgDiv.innerHTML = msgValue;
            link.appendChild(msgDiv);
          }
        });
      }
      const time = document.createElement("small");
      time.className = "time text-muted";
      time.id = `room${NowAtRoomID}Time`;
      time.innerHTML = currentTime;
      link.appendChild(time);
      const replayStatus = document.createElement("small");
      replayStatus.id = `room${NowAtRoomID}ReadStatus`;
      replayStatus.className = "chat-alert text-muted";
      const icon = document.createElement("i");
      icon.className = "fa fa-reply";
      replayStatus.appendChild(icon);
      link.appendChild(replayStatus);
      friendul.appendChild(frinedLi);
      const newRoomLi = document.querySelector(`#room${NowAtRoomID}`);
      newRoomLi.style.order = order - 1;
      order -= 1;
    }
    msg.value = "";
  }
}

socket.on("newMsg", msgInfo => {
  const chatUl = document.querySelector("#chat");
  // 如果在該房間要及時append訊息
  // 不在該房間就不用，因為他點進去那個房間就會render最新訊息
  if (msgInfo.room_id == NowAtRoomID) {
    const msgLi = document.createElement("li");
    msgLi.className = "left clearfix";
    chatUl.appendChild(msgLi);
    const sourceImgSpan = document.createElement("span");
    sourceImgSpan.className = "chat-img pull-left";
    msgLi.appendChild(sourceImgSpan);
    const sourceImg = document.createElement("img");
    sourceImg.className = "sourceImg";
    sourceImg.src = msgInfo.source_pic;
    sourceImg.alt = alt = "User Avatar";
    sourceImgSpan.appendChild(sourceImg);
    const chatBodyDiv = document.createElement("div");
    chatBodyDiv.className = "chat-body clearfix";
    msgLi.appendChild(chatBodyDiv);
    const headerDiv = document.createElement("div");
    headerDiv.className = "header";
    chatBodyDiv.appendChild(headerDiv);
    const sourceName = document.createElement("strong");
    sourceName.className = "primary-font";
    sourceName.innerHTML = msgInfo.source_name;
    headerDiv.appendChild(sourceName);
    const time = document.createElement("small");
    time.className = "pull-right text-muted";
    time.innerHTML = msgInfo.time;
    headerDiv.appendChild(time);
    const text = document.createElement("p");
    text.innerHTML = msgInfo.msg;
    chatBodyDiv.appendChild(text);
    const chatRoom = document.querySelector("#chat-message");
    chatRoom.scrollTo(0, chatRoom.scrollHeight);
  }
  // 把該訊息聊天室移到列表的第一個(前提是這個聊天室本來就在聊天列表，如果沒有就要創一個新的(表示這兩個人之前沒有聊過天))
  const roomLi = document.querySelector(`#room${msgInfo.room_id}`);
  if (roomLi) {
    // 更改聊天室的最新時間和訊息
    const lastMsg = document.querySelector(`#room${msgInfo.room_id}Msg`);
    const lastTime = document.querySelector(`#room${msgInfo.room_id}Time`);
    lastMsg.innerHTML = msgInfo.msg;
    lastTime.innerHTML = msgInfo.time;
    roomLi.style.order = order - 1;
    order -= 1;
    // 判斷有沒有開著該聊天室
    // 如果在該聊天室,icon變成已讀
    if (msgInfo.room_id == NowAtRoomID) {
      const readStatus = document.querySelector(`#room${NowAtRoomID}ReadStatus`);
      while (readStatus.firstChild) {
        readStatus.removeChild(readStatus.firstChild);
      }
      readStatus.className = "chat-alert text-muted";
      const icon = document.createElement("i");
      icon.className = "fa fa-check";
      readStatus.appendChild(icon);
    } else {
      // 如果沒有,icon如果有未讀數字，要變成未讀數字＋1，沒有未讀數字的話，直接變成一則未讀
      const readStatus = document.querySelector(`#room${msgInfo.room_id}ReadStatus`);
      if (readStatus.innerHTML.length <= 3) {
        // 還要看有沒有超過10則未讀
        if (parseInt(readStatus.innerHTML) + 1 > 10) {
          readStatus.innerHTML = "10+";
        } else {
          readStatus.innerHTML = parseInt(readStatus.innerHTML) + 1;
        }
      } else {
        // 本來是已讀或已回覆要改成有新訊息
        while (readStatus.firstChild) {
          readStatus.removeChild(readStatus.firstChild);
        }
        readStatus.className = "chat-alert label label-danger text-center unreadNum";
        readStatus.innerHTML = 1;
      }
    }
  } else {
    // 新的聊天室沒有roomLi要新創一個並且移到對頂端
    const friendul = document.querySelector("#friendul");
    const frinedLi = document.createElement("li");
    const link = document.createElement("a");
    frinedLi.setAttribute("onclick", `getMsg('${msgInfo.room_id}')`);
    frinedLi.id = `room${msgInfo.room_id}`;
    link.href = "#";
    link.className = "clearfix";
    frinedLi.appendChild(link);
    const friendImg = document.createElement("img");
    friendImg.src = msgInfo.source_pic;
    friendImg.className = "img-circle friendImg";
    link.appendChild(friendImg);
    const NameDiv = document.createElement("div");
    NameDiv.className = "friend-name";
    const Name = document.createElement("strong");
    Name.innerHTML = msgInfo.source_name;
    link.appendChild(Name);
    const msgDiv = document.createElement("div");
    msgDiv.className = "last-message text-muted";
    msgDiv.id = `room${msgInfo.room_id}Msg`;
    msgDiv.innerHTML = `${msgInfo.msg}`;
    link.appendChild(msgDiv);
    const time = document.createElement("small");
    time.className = "time text-muted";
    time.id = `room${msgInfo.room_id}Time`;
    time.innerHTML = `${msgInfo.time}`;
    link.appendChild(time);
    // 直接是一則新訊息未讀的狀態
    const unRead = document.createElement("small");
    unRead.id = `room${msgInfo.room_id}ReadStatus`;
    unRead.className = "chat-alert label label-danger text-center unreadNum";
    unRead.innerHTML = 1;
    link.appendChild(unRead);
    friendul.appendChild(frinedLi);
    const newRoomLi = document.querySelector(`#room${msgInfo.room_id}`);
    newRoomLi.style.order = order - 1;
    order -= 1;
  }
});

function back () {
  window.history.go(-1);
}
