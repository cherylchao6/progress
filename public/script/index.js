const token = localStorage.getItem("token");
getProgress();
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
  if (toWhom == myID) {
    msgBadge.style.display = "block";
  }
});

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

$(".owl-carousel").owlCarousel({
  loop: true,
  margin: 10,
  nav: true,
  navText: ["<div class='nav-btn prev-slide'></div>", "<div class='nav-btn next-slide'></div>"],
  responsive: {
    0: {
      items: 1
    },
    600: {
      items: 3
    },
    1000: {
      items: 5
    }
  }
});

function getProgress () {
  fetch("/api/1.0/topProgresses", {
    method: "GET",
    headers: { authorization: `Bearer ${token}` }
  }).then(response => {
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 401) {
      alert("請先登入");
      return window.location.assign("/signin");
    } else if (response.status === 403) {
      alert("登入逾期");
      return window.location.assign("/signin");
    }
  })
    .then(data => {
      if (data) {
        const owl = $(".sport");
        for (const i in data.sport) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.sport[i].id}`;
          itemDiv.appendChild(progressLink);
          const progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.sport[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.sport[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          $(".sport").trigger("add.owl.carousel", [itemDiv, 0]);
        }
        owl.trigger("refresh.owl.carousel");
        const owl2 = $(".growth");
        for (const i in data.growth) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.growth[i].id}`;
          itemDiv.appendChild(progressLink);
          const progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.growth[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.growth[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          $(".growth").trigger("add.owl.carousel", [itemDiv, 0]);
        }
        owl2.trigger("refresh.owl.carousel");
        const owl3 = $(".outlook");
        for (const i in data.outlook) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.outlook[i].id}`;
          itemDiv.appendChild(progressLink);
          const progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.outlook[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.outlook[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          $(".outlook").trigger("add.owl.carousel", [itemDiv, 0]);
        }
        owl3.trigger("refresh.owl.carousel");
        const owl4 = $(".garden");
        for (const i in data.garden) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.garden[i].id}`;
          itemDiv.appendChild(progressLink);
          const progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.garden[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.garden[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          $(".garden").trigger("add.owl.carousel", [itemDiv, 0]);
        }
        owl4.trigger("refresh.owl.carousel");
        const owl5 = $(".learn");
        for (const i in data.learn) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.learn[i].id}`;
          itemDiv.appendChild(progressLink);
          const progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.learn[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.learn[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          $(".learn").trigger("add.owl.carousel", [itemDiv, 0]);
        }
        owl5.trigger("refresh.owl.carousel");
        const owl6 = $(".house");
        for (const i in data.house) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.house[i].id}`;
          itemDiv.appendChild(progressLink);
          const progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.house[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.house[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          $(".house").trigger("add.owl.carousel", [itemDiv, 0]);
        }
        owl6.trigger("refresh.owl.carousel");
        const owl7 = $(".cook");
        for (const i in data.cook) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.cook[i].id}`;
          itemDiv.appendChild(progressLink);
          const progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.cook[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.cook[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          $(".cook").trigger("add.owl.carousel", [itemDiv, 0]);
        }
        owl7.trigger("refresh.owl.carousel");
        const owl8 = $(".art");
        for (const i in data.art) {
          const itemDiv = document.createElement("div");
          itemDiv.className = "item";
          const progressLink = document.createElement("a");
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.art[i].id}`;
          itemDiv.appendChild(progressLink);
          const progressInfoBorder = document.createElement("div");
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          const progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          const name = document.createElement("p");
          name.className = "progressNameFont";
          name.innerHTML = data.art[i].name;
          progressNameDiv.appendChild(name);
          const imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          const img = document.createElement("img");
          img.src = data.art[i].picture;
          img.className = "progressImage";
          imgDiv.appendChild(img);
          $(".art").trigger("add.owl.carousel", [itemDiv, 0]);
        }
        owl8.trigger("refresh.owl.carousel");
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
