

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
      Swal.fire(
        {
          title:"此信箱尚未註冊會員喔",
          icon:"warning",
          confirmButtonColor: '#132235',
          confirmButtonText: 'OK',
        }
      );
      } else if (response.status === 403) {
        Swal.fire(
          {
            title:"密碼好像不對欸",
            icon:"error",
            confirmButtonColor: '#132235',
            confirmButtonText: 'OK',
          }
        );
      }
    })
    .then (data => {
      if (data) {
        let token = data.data['access_token'];
        window.localStorage.setItem('token', `${token}`);
        Swal.fire(
          {
            title:"登入成功",
            icon:"success",
            confirmButtonColor: '#132235',
            confirmButtonText: 'OK',
          }
        ).then(()=>{
          window.location.assign('/progressClub.html');
        });
      } 
    });
}

