/**
 * AUTH.JS - Authentication Handling
 * Menangani autentikasi login, register, dan logout
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;

  // Initialize authentication based on current page
  if (currentPage.includes('login.html') || currentPage.includes('login')) {
    initLoginPage();
  } else if (currentPage.includes('register.html') || currentPage.includes('register')) {
    initRegisterPage();
  } else if (currentPage.includes('auth-success.html') || currentPage.includes('auth-success')) {
    initAuthSuccessPage();
  }
});

/**
 * Initialize Login Page
 */
function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

  if (!loginForm) return;

  // Store original button text
  if (submitBtn) {
    submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
  }

  // Add real-time form validation
  if (emailInput && passwordInput) {
    // Email validation on blur
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !window.AppUtils.validateEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
      } else if (emailInput.value) {
        emailInput.classList.add('is-valid');
        emailInput.classList.remove('is-invalid');
      }
    });

    // Password validation on input
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

    // Clear validation on focus
    [emailInput, passwordInput].forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('is-invalid', 'is-valid');
      });
    });
  }

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Basic validation
    if (!email || !password) {
      window.AppUtils.showToast('error', 'Email dan password harus diisi');
      return;
    }

    // Email validation
    if (!window.AppUtils.validateEmail(email)) {
      window.AppUtils.showToast('error', 'Format email tidak valid');
      return;
    }

    try {
      // Disable submit button and show loading
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
        // Store token
        localStorage.setItem('token', data.token);
        window.AppUtils.showToast('success', 'Login berhasil! Mengalihkan...');

        // Redirect to dashboard after short delay
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

      // Enhanced error handling with better user messages
      window.AppUtils.handleApiError(error, 'during login');
    } finally {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Sign In';
      }
    }
  });
}

/**
 * Initialize Register Page
 */
function initRegisterPage() {
  const registerForm = document.getElementById('register-form');
  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const confirmPasswordInput = document.getElementById('register-confirm-password');
  const submitBtn = registerForm ? registerForm.querySelector('button[type="submit"]') : null;

  if (!registerForm) return;

  // Store original button text
  if (submitBtn) {
    submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
  }

  // Add real-time form validation
  if (nameInput && emailInput && passwordInput) {
    // Name validation on blur
    nameInput.addEventListener('blur', () => {
      if (nameInput.value && nameInput.value.length < 2) {
        nameInput.classList.add('is-invalid');
        nameInput.classList.remove('is-valid');
      } else if (nameInput.value.length >= 2) {
        nameInput.classList.add('is-valid');
        nameInput.classList.remove('is-invalid');
      }
    });

    // Email validation on blur
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !window.AppUtils.validateEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
      } else if (emailInput.value) {
        emailInput.classList.add('is-valid');
        emailInput.classList.remove('is-invalid');
      }
    });

    // Password validation on input
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

    // Clear validation on focus
    [nameInput, emailInput, passwordInput].forEach(input => {
      input.addEventListener('focus', () => {
        input.classList.remove('is-invalid', 'is-valid');
      });
    });
  }

  registerForm.addEventListener('submit', async e => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    // No confirm password field in the form
    const confirmPassword = password;

    // Basic validation
    if (!name || !email || !password) {
      window.AppUtils.showToast('error', 'Semua field harus diisi');
      return;
    }

    // Name validation
    if (name.length < 2) {
      window.AppUtils.showToast('error', 'Nama minimal 2 karakter');
      return;
    }

    // Email validation
    if (!window.AppUtils.validateEmail(email)) {
      window.AppUtils.showToast('error', 'Format email tidak valid');
      return;
    }

    if (password.length < 6) {
      window.AppUtils.showToast('error', 'Password minimal 6 karakter');
      return;
    }

    try {
      // Disable submit button and show loading
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

        // Redirect to login after short delay
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

      // Enhanced error handling with better user messages
      window.AppUtils.handleApiError(error, 'during registration');
    } finally {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Create Account';
      }
    }
  });
}

/**
 * Initialize Auth Success Page (Google OAuth callback)
 */
function initAuthSuccessPage() {
  // Get token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    // Store token
    localStorage.setItem('token', token);
    window.AppUtils.showToast('success', 'Login berhasil! Mengalihkan ke dashboard...');

    // Redirect to dashboard
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

/**
 * Google OAuth Login Handler
 */
function handleGoogleLogin() {
  window.location.href = `${window.AppUtils.API_BASE_URL}/auth/google`;
}

/**
 * Logout Handler
 */
function handleLogout() {
  localStorage.removeItem('token');
  window.AppUtils.showToast('success', 'Logout berhasil');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
}

// Export functions for global access
window.handleGoogleLogin = handleGoogleLogin;
window.handleLogout = handleLogout;
