
let token = localStorage.getItem("token");

const socket = io({
  auth: {
  token
}
});

socket.on("connect_error", (err) => {
  console.log(err.message);
  if (err.message) {
    alert(err.message);
    return window.location.assign('/signin');
  }
});

socket.on('userInfo', (userInfo)=>{
  console.log("here");
  console.log(userInfo);
  //localStorage只能存string
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  // var cat = localStorage.getItem('userInfo');
  // console.log(JSON.parse(cat).name);
});

let time = new Date().toLocaleString();
console.log(time);


var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function(e) {
e.preventDefault();
let time = new Date().toLocaleString();
if (input.value) {
  socket.emit('chat message', {
    id: socket.id,
    content: input.value,
    time
  });
  input.value = '';
}
});





// socket.on('chat message', function(msg) {
//   var item = document.createElement('li');
//   item.textContent = msg;
//   messages.appendChild(item);
//   window.scrollTo(0, document.body.scrollHeight);
// });

