const USERS_BASE = '/users';

function safeJson(response) {
  if (!response.ok) {
    return response.text().then((text) => {
      throw new Error(text || response.statusText);
    });
  }
  return response.json();
}

export function getStoredUser() {
  const id = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  return id && role
    ? {
        id: Number(id),
        role,
        name: name ?? '',
      }
    : null;
}

export function setStoredUser({ id, role, name }) {
  localStorage.setItem('userId', String(id));
  localStorage.setItem('role', role);
  localStorage.setItem('name', name);
}

export function clearStoredUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
}

export function requireAuth({ allow = ['STUDENT', 'ADMIN'], redirectTo = 'login.html' } = {}) {
  const user = getStoredUser();
  if (!user || !allow.includes(user.role)) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

export async function login({ email, password }) {
  const response = await fetch(`${USERS_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const user = await safeJson(response);
  setStoredUser(user);
  return user;
}

export async function register({ name, email, password, role }) {
  const response = await fetch(`${USERS_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  return safeJson(response);
}

export function attachAuthActions() {
  const user = getStoredUser();
  const logoutButton = document.getElementById('logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearStoredUser();
      window.location.href = 'login.html';
    });
  }

  const loginLink = document.querySelector('a[href="login.html"]');
  if (loginLink && user) {
    loginLink.style.display = 'none';
  }

  const registerLink = document.querySelector('a[href="register.html"]');
  if (registerLink && user) {
    registerLink.style.display = 'none';
  }
}

export function redirectToDashboard(user) {
  if (!user) return;
  if (user.role === 'ADMIN') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

// Page initialization
const page = document.body.dataset.page;
if (page === 'login') {
  attachAuthActions();
  const form = document.getElementById('login-form');
  const status = document.getElementById('form-status');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    const formData = new FormData(form);
    try {
      const user = await login({
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
      });
      redirectToDashboard(user);
    } catch (err) {
      status.textContent = err.message;
      status.className = 'status error';
    }
  });
}

if (page === 'register') {
  attachAuthActions();
  const form = document.getElementById('register-form');
  const status = document.getElementById('form-status');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    const formData = new FormData(form);
    try {
      await register({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
        role: String(formData.get('role') ?? 'STUDENT'),
      });
      status.textContent = 'Registration successful! Redirecting to login...';
      status.className = 'status success';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
    } catch (err) {
      status.textContent = err.message;
      status.className = 'status error';
    }
  });
}

if (page === 'dashboard' || page === 'list' || page === 'add' || page === 'edit' || page === 'admin') {
  attachAuthActions();
  const user = getStoredUser();
  const avatarEl = document.getElementById('sidebar-avatar');
  const nameEl = document.getElementById('sidebar-name');
  const roleEl = document.getElementById('sidebar-role');
  if (user && avatarEl) avatarEl.textContent = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?';
  if (user && nameEl) nameEl.textContent = user.name || 'User';
  if (user && roleEl) roleEl.textContent = user.role || '';
}
