let token = localStorage.getItem("token");
getProgress ()
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

$('.owl-carousel').owlCarousel({
  loop:true,
  margin:10,
  nav:true,
  navText:["<div class='nav-btn prev-slide'></div>","<div class='nav-btn next-slide'></div>"],
  responsive:{
      0:{
          items:1
      },
      600:{
          items:3
      },
      1000:{
          items:5
      }
  }
});

function getProgress () {
  fetch(`/api/1.0/topProgresses`,{
    method: "GET",
    headers: { 'authorization': `Bearer ${token}` },
  }).then(response => {
    if (response.status === 200 ) {
      return response.json();
    } else if (response.status === 401) {
      alert('請先登入');
      return window.location.assign('/signin');
      } else if (response.status === 403) {
        alert('登入逾期');
        return window.location.assign('/signin');
      }
    })
    .then (data => {
      if (data) {
        console.log(data);
        var owl = $('.sport');
        for (let i in data.sport) {
          let itemDiv = document.createElement("div");
          itemDiv.className = "item";
          let progressLink = document.createElement('a');
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.sport[i].id}`;
          itemDiv.appendChild(progressLink);
          let progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.sport[i].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.sport[i].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
          $('.sport').trigger('add.owl.carousel',[itemDiv,0]);
        }
        owl.trigger('refresh.owl.carousel'); 
        var owl2 = $('.growth');
        for (let i in data.growth) {
          let itemDiv = document.createElement("div");
          itemDiv.className = "item";
          let progressLink = document.createElement('a');
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.growth[i].id}`;
          itemDiv.appendChild(progressLink);
          let progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.growth[i].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.growth[i].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
          $('.growth').trigger('add.owl.carousel',[itemDiv,0]);
        }
        owl2.trigger('refresh.owl.carousel');
        var owl3 = $('.outlook');
        for (let i in data.outlook) {
          let itemDiv = document.createElement("div");
          itemDiv.className = "item";
          let progressLink = document.createElement('a');
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.outlook[i].id}`;
          itemDiv.appendChild(progressLink);
          let progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.outlook[i].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.outlook[i].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
          $('.outlook').trigger('add.owl.carousel',[itemDiv,0]);
        }
        owl3.trigger('refresh.owl.carousel');
        var owl4 = $('.garden');
        for (let i in data.garden) {
          let itemDiv = document.createElement("div");
          itemDiv.className = "item";
          let progressLink = document.createElement('a');
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.garden[i].id}`;
          itemDiv.appendChild(progressLink);
          let progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.garden[i].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.garden[i].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
          $('.garden').trigger('add.owl.carousel',[itemDiv,0]);
        }
        owl4.trigger('refresh.owl.carousel');
        var owl5 = $('.learn');
        for (let i in data.learn) {
          let itemDiv = document.createElement("div");
          itemDiv.className = "item";
          let progressLink = document.createElement('a');
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.learn[i].id}`;
          itemDiv.appendChild(progressLink);
          let progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.learn[i].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.learn[i].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
          $('.learn').trigger('add.owl.carousel',[itemDiv,0]);
        }
        owl5.trigger('refresh.owl.carousel');
        var owl6 = $('.house');
        for (let i in data.house) {
          let itemDiv = document.createElement("div");
          itemDiv.className = "item";
          let progressLink = document.createElement('a');
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.house[i].id}`;
          itemDiv.appendChild(progressLink);
          let progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.house[i].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.house[i].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
          $('.house').trigger('add.owl.carousel',[itemDiv,0]);
        }
        owl6.trigger('refresh.owl.carousel');
        var owl7 = $('.cook');
        for (let i in data.cook) {
          let itemDiv = document.createElement("div");
          itemDiv.className = "item";
          let progressLink = document.createElement('a');
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.cook[i].id}`;
          itemDiv.appendChild(progressLink);
          let progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.cook[i].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.cook[i].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
          $('.cook').trigger('add.owl.carousel',[itemDiv,0]);
        }
        owl7.trigger('refresh.owl.carousel');
        var owl8 = $('.art');
        for (let i in data.art) {
          let itemDiv = document.createElement("div");
          itemDiv.className = "item";
          let progressLink = document.createElement('a');
          progressLink.className = "progressLink";
          progressLink.href = `progress?progressid=${data.art[i].id}`;
          itemDiv.appendChild(progressLink);
          let progressInfoBorder = document.createElement('div');
          progressInfoBorder.className = "progressInfoBorder";
          progressLink.appendChild(progressInfoBorder);
          let progressNameDiv = document.createElement("div");
          progressNameDiv.className = "text-center progressName";
          progressInfoBorder.appendChild(progressNameDiv);
          let name = document.createElement('p');
          name.className = "progressNameFont";
          name.innerHTML = data.art[i].name;
          progressNameDiv.appendChild(name);
          let imgDiv = document.createElement("div");
          imgDiv.className = "imageDiv";
          progressInfoBorder.appendChild(imgDiv);
          let img = document.createElement('img');
          img.src = data.art[i].picture;
          img.className = 'progressImage';
          imgDiv.appendChild(img);
          $('.art').trigger('add.owl.carousel',[itemDiv,0]);
        }
        owl8.trigger('refresh.owl.carousel');
      }
    });
}

function search () {
  let keyword = document.querySelector('#search').value;
  if (keyword !== '') {
    window.location.assign(`/category.html?keyword=${keyword}`);
  } 
}
