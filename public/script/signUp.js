function signUp () {
  let name = document.getElementById('name').value;
  let email = document.getElementById('email').value;
  let password = document.getElementById('password').value;
  if (name == "" || email == "" || password == "") {
    alert('請輸入完整資訊')
    return;
  }
  let data = {
    name,
    email,
    password
  };
  fetch('/signup',{
    method: "POST",
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }).then(response => {
    console.log(response.status);
    if (response.status === 200 ) {
      return response.json();
    } else if (response.status === 403) {
      Swal.fire(
        {
          title:"此信箱已被註冊過",
          icon:"warning",
          confirmButtonColor: '#132235',
          confirmButtonText: 'OK',
        }
      );
    }
    })
    .then(data => {
      if (data) {
        let token = data.data['access_token'];
        window.localStorage.setItem('token', `${token}`);
        Swal.fire(
          {
            title:"註冊成功",
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



