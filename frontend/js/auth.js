// =============================
// AUTH.JS - Authentication Handling
// Menangani autentikasi login, register, dan logout
// =============================

// =============================
// Main Entry: Init Auth Page Based on URL
// =============================
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;

  // Inisialisasi halaman autentikasi sesuai URL
  if (currentPage.includes('login.html') || currentPage.includes('login')) {
    initLoginPage();
  } else if (currentPage.includes('register.html') || currentPage.includes('register')) {
    initRegisterPage();
  } else if (currentPage.includes('auth-success.html') || currentPage.includes('auth-success')) {
    initAuthSuccessPage();
  }
});

// =============================
// Inisialisasi Halaman Login
// =============================
function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

  if (!loginForm) return;

  // Simpan teks asli tombol submit
  if (submitBtn) {
    submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
  }

  // Validasi real-time form login
  if (emailInput && passwordInput) {
    // Validasi email saat blur
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !window.AppUtils.validateEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
      } else if (emailInput.value) {
        emailInput.classList.add('is-valid');
        emailInput.classList.remove('is-invalid');
      }
    });

    // Validasi password saat input
    passwordInput.addEventListener('input', () => {
      if (passwordInput.value.length > 0) {
        if (passwordInput.value.length < 6) {
          passwordInput.classList.add('is-invalid');
          passwordInput.classList.remove('is-valid');
        } else {
          passwordInput.classList.add('is-valid');
          passwordInput.classList.remove('is-invalid');
        }
      }
    });

    // Reset validasi saat focus
    [emailInput, passwordInput].forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('is-invalid', 'is-valid');
      });
    });
  }

  // Submit login
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validasi dasar
    if (!email || !password) {
      window.AppUtils.showToast('error', 'Email dan password harus diisi');
      return;
    }

    // Validasi email
    if (!window.AppUtils.validateEmail(email)) {
      window.AppUtils.showToast('error', 'Format email tidak valid');
      return;
    }

    try {
      // Disable tombol dan tampilkan loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';
      }

      const response = await fetch(`${window.AppUtils.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan token
        localStorage.setItem('token', data.token);
        window.AppUtils.showToast('success', 'Login berhasil! Mengalihkan...');

        // Redirect ke dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        window.AppUtils.showToast(
          'error',
          data.message || 'Login failed. Please check your credentials.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      window.AppUtils.handleApiError(error, 'during login');
    } finally {
      // Enable tombol kembali
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Sign In';
      }
    }
  });
}

// =============================
// Inisialisasi Halaman Register
// =============================
function initRegisterPage() {
  const registerForm = document.getElementById('register-form');
  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const confirmPasswordInput = document.getElementById('register-confirm-password');
  const submitBtn = registerForm ? registerForm.querySelector('button[type="submit"]') : null;

  if (!registerForm) return;

  // Simpan teks asli tombol submit
  if (submitBtn) {
    submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
  }

  // Validasi real-time form register
  if (nameInput && emailInput && passwordInput) {
    // Validasi nama saat blur
    nameInput.addEventListener('blur', () => {
      if (nameInput.value && nameInput.value.length < 2) {
        nameInput.classList.add('is-invalid');
        nameInput.classList.remove('is-valid');
      } else if (nameInput.value.length >= 2) {
        nameInput.classList.add('is-valid');
        nameInput.classList.remove('is-invalid');
      }
    });

    // Validasi email saat blur
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !window.AppUtils.validateEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
      } else if (emailInput.value) {
        emailInput.classList.add('is-valid');
        emailInput.classList.remove('is-invalid');
      }
    });

    // Validasi password saat input
    passwordInput.addEventListener('input', () => {
      if (passwordInput.value.length > 0) {
        if (passwordInput.value.length < 6) {
          passwordInput.classList.add('is-invalid');
          passwordInput.classList.remove('is-valid');
        } else {
          passwordInput.classList.add('is-valid');
          passwordInput.classList.remove('is-invalid');
        }
      }
    });

    // Reset validasi saat focus
    [nameInput, emailInput, passwordInput].forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('is-invalid', 'is-valid');
      });
    });
  }

  // Submit register
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    // Tidak ada field confirm password di form
    const confirmPassword = password;

    // Validasi dasar
    if (!name || !email || !password) {
      window.AppUtils.showToast('error', 'Semua field harus diisi');
      return;
    }

    // Validasi nama
    if (name.length < 2) {
      window.AppUtils.showToast('error', 'Nama minimal 2 karakter');
      return;
    }

    // Validasi email
    if (!window.AppUtils.validateEmail(email)) {
      window.AppUtils.showToast('error', 'Format email tidak valid');
      return;
    }

    if (password.length < 6) {
      window.AppUtils.showToast('error', 'Password minimal 6 karakter');
      return;
    }

    try {
      // Disable tombol dan tampilkan loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Creating account...';
      }

      const response = await fetch(`${window.AppUtils.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        window.AppUtils.showToast('success', 'Akun berhasil dibuat! Silakan login.');

        // Redirect ke login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        window.AppUtils.showToast(
          'error',
          data.message || 'Registration failed. Please try again.'
        );
      }
    } catch (error) {
      console.error('Register error:', error);
      window.AppUtils.handleApiError(error, 'during registration');
    } finally {
      // Enable tombol kembali
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Create Account';
      }
    }
  });
}

// =============================
// Inisialisasi Halaman Auth Success (Google OAuth Callback)
// =============================
function initAuthSuccessPage() {
  // Ambil token dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    // Simpan token
    localStorage.setItem('token', token);
    window.AppUtils.showToast('success', 'Login berhasil! Mengalihkan ke dashboard...');

    // Redirect ke dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  } else {
    window.AppUtils.showToast('error', 'Token tidak ditemukan');
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  }
}

// =============================
// Google OAuth Login Handler
// =============================
function handleGoogleLogin() {
  window.location.href = `${window.AppUtils.API_BASE_URL}/auth/google`;
}

// =============================
// Logout Handler
// =============================
function handleLogout() {
  localStorage.removeItem('token');
  window.AppUtils.showToast('success', 'Logout berhasil');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
}

// Ekspor fungsi ke global agar bisa dipakai di HTML
window.handleGoogleLogin = handleGoogleLogin;
window.handleLogout = handleLogout;
