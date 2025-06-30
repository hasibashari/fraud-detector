// =========================
// Script Auth & Proteksi Frontend
// =========================
document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // Konstanta API
  // =========================
  const API_URL = 'http://localhost:3001';

  // =========================
  // Elemen Form & UI
  // =========================
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const logoutButton = document.getElementById('logout-button');
  const loginMessage = document.getElementById('login-message');
  const registerMessage = document.getElementById('register-message');

  // =========================
  // Logika Registrasi
  // =========================
  if (registerForm) {
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        registerMessage.textContent = 'Registration successful! You can now log in.';
        registerMessage.style.color = 'green';

        setTimeout(() => {
          window.location.href = '/login'; // Redirect ke halaman login setelah 2 detik
        }, 2000);
      } catch (error) {
        registerMessage.textContent = error.message;
        registerMessage.style.color = 'red';
      }
    });
  }

  // =========================
  // Logika Login
  // =========================
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Simpan token ke localStorage
        localStorage.setItem('token', data.token);

        // Redirect ke halaman dashboard (index.html)
        window.location.href = '/dashboard';
      } catch (error) {
        loginMessage.textContent = error.message;
        loginMessage.style.color = 'red';
      }
    });
  }

  // =========================
  // Logika Dashboard & Proteksi
  // =========================
  if (window.location.pathname === '/dashboard') {
    const token = localStorage.getItem('token');
    const userNameSpan = document.getElementById('user-name');

    // Proteksi sisi klien
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Ambil data user
    fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // Kirim token di header
      },
    })
      .then(res => {
        if (!res.ok) {
          localStorage.removeItem('token'); // Hapus token jika tidak valid
          window.location.href = '/login';
          throw new Error('Session expired or invalid token');
        }
        return res.json();
      })
      .then(data => {
        // tampilkan nama user di dashboard
        userNameSpan.textContent = data.name;
      })
      .catch(error => {
        console.error(error.message);
      });
  }

  // =========================
  // Logika Logout
  // =========================
  if (logoutButton) {
    logoutButton.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('token'); // Hapus token dari localStorage
      window.location.href = '/login'; // Redirect ke halaman login
    });
  }
});
