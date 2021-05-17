

function signIn () {
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  if (email == "" || password == "") {
    alert('請輸入完整資訊')
    return;
  }
  let data = {
    email,
    password
  };
  fetch('/signin',{
    method: "POST",
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }).then(response => {
    if (response.status === 200 ) {
      return response.json();
    } else if (response.status === 401) {
      alert('此信箱尚未註冊會員喔～');
      return window.location.assign('/signup');
      } else if (response.status === 403) {
        alert('密碼好像不對欸');
        return window.location.assign('/signin');
      }
    })
    .then (data => {
      if (data) {
        alert('登入成功');
        let token = data.data['access_token'];
        window.localStorage.setItem('token', `${token}`);
        // return window.location.assign('/index.html');
      } 
    });
}

