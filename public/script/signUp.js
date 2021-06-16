function signUp () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const data = {
    name,
    email,
    password
  };
  fetch("/signup", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  }).then(async (response) => {
    console.log(response.status);
    if (response.status === 200) {
      return response.json();
    } else if (response.status === 403) {
      Swal.fire(
        {
          title: "此信箱已被註冊過",
          icon: "warning",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    } else if (response.status === 400) {
      const msg = await response.json();
      Swal.fire(
        {
          title: msg.error,
          icon: "warning",
          confirmButtonColor: "#132235",
          confirmButtonText: "OK"
        }
      );
    }
  })
    .then(data => {
      if (data) {
        const token = data.data.access_token;
        window.localStorage.setItem("token", `${token}`);
        Swal.fire(
          {
            title: "註冊成功",
            icon: "success",
            confirmButtonColor: "#132235",
            confirmButtonText: "OK"
          }
        ).then(() => {
          window.location.assign("/progressClub.html");
        });
      }
    });
}
