// Get API query parameter
let token = localStorage.getItem("token");
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userid");
getUserInfo ();
//get Author profile 
function getUserInfo () {
  fetch(`/api/1.0/user?userid=${userId}`,{
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
        if (data.shareRoomID) {
          let msgLink = document.querySelector('#msgLink');
          msgLink.href = `/chatroom.html?roomid=${data.shareRoomID}&user1id=${data.author}&user2id=${data.vistor}`;
        }
        let userName = document.querySelector('#userName');
        userName.innerHTML = data.name;
        let fans = document.querySelector('#fans');
        fans.innerHTML = `粉絲 ${data.follower}`;
        let idols = document.querySelector('#idols');
        idols.innerHTML = `偶像 ${data.following}`;
        // let finishedProgress = document.querySelector('#finishedProgress');
        // finishedProgress.innerHTML = data.finishedProgress;
        let motto = document.querySelector('#motto');
        motto.innerHTML = data.motto;
        let userPicture = document.querySelector('#userPicture');
        userPicture.src = data.photo;
        let editProfile = document.querySelector('#editProfile');
        let followBtn = document.querySelector("#followBtn");
        let msgBtn = document.querySelector('#MessageBtn');
        if (data.author == data.vistor) {
          editProfile.style.display = "flex";
          followBtn.style.display = "none";
          msgBtn.style.display = "none";
        }
        let finishedProgress = document.querySelector('#finishedProgress');
        let unfinishedProgress = document.querySelector('#unfinishedProgress');
        finishedProgress.innerHTML = `${data.finishedProgress}</br>Progress</br>Finished</br>`;
        unfinishedProgress.innerHTML = `${data.unfinishedProgress}</br>Progress</br>To Go</br>`;
      }
    });
}