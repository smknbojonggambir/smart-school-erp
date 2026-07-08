document.addEventListener('DOMContentLoaded', () => {
  // Cek jika sudah login, redirect ke dashboard
  if (checkSession()) {
    window.location.href = 'dashboard.html';
  }

  // Fitur Toggle Password Visibility
  const togglePassword = document.querySelector('#togglePassword');
  const password = document.querySelector('#password');
  
  if(togglePassword) {
    togglePassword.addEventListener('click', function (e) {
      const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
      password.setAttribute('type', type);
      this.querySelector('i').classList.toggle('bi-eye');
      this.querySelector('i').classList.toggle('bi-eye-slash');
    });
  }

  // Handle Form Login Submit
  const loginForm = document.getElementById('loginForm');
  if(loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const roleInput = document.getElementById('role').value;
      const usernameInput = document.getElementById('username').value;
      const passwordInput = document.getElementById('password').value;
      
      const btnText = document.getElementById('loginText');
      const btnSpinner = document.getElementById('loginSpinner');
      const btnLogin = document.getElementById('btnLogin');

      // Set Loading State
      btnText.classList.add('d-none');
      btnSpinner.classList.remove('d-none');
      btnLogin.disabled = true;

      try {
        // Panggil API (Routing ditangani di Apps Script)
        const responseData = await API.request('login', {
          username: usernameInput,
          password: passwordInput,
          role: roleInput // Optional: Bisa divalidasi di backend agar role sesuai
        });

        // Simpan Session ke LocalStorage
        const sessionData = {
          token: responseData.token,
          user: responseData.user,
          loginTime: new Date().getTime(),
          expiresIn: 24 * 60 * 60 * 1000 // Contoh exp: 24 jam
        };
        localStorage.setItem('smartSchoolSession', JSON.stringify(sessionData));

        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: `Selamat datang, ${responseData.user.username}!`,
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          // Redirect ke Dashboard
          window.location.href = 'dashboard.html';
        });

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: error.message || 'Periksa kembali Username, Password, dan Role Anda.',
        });
      } finally {
        // Reset Loading State
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
        btnLogin.disabled = false;
      }
    });
  }
});

// Fungsi untuk mengecek sesi aktif (akan dipanggil di dashboard.js juga)
function checkSession() {
  const sessionStr = localStorage.getItem('smartSchoolSession');
  if (!sessionStr) return false;
  
  try {
    const session = JSON.parse(sessionStr);
    const currentTime = new Date().getTime();
    
    // Auto logout jika token expire
    if (currentTime - session.loginTime > session.expiresIn) {
      localStorage.removeItem('smartSchoolSession');
      return false;
    }
    return true;
  } catch(e) {
    return false;
  }
}

// Fungsi untuk Logout global
function logout() {
  localStorage.removeItem('smartSchoolSession');
  window.location.href = 'login.html';
}
