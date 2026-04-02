import { getProfile, updateProfile, getItems } from './api.js';
import { requireAuth, getStoredUser, clearStoredUser, setStoredUser } from './auth.js';

const user = requireAuth({ redirectTo: 'login.html' });
if (!user) throw new Error('Not authenticated');

// Sidebar
const avatarEl = document.getElementById('sidebar-avatar');
const nameEl = document.getElementById('sidebar-name');
const roleEl = document.getElementById('sidebar-role');
const navAdmin = document.getElementById('nav-admin');
const navDashboard = document.getElementById('nav-dashboard');

if (user.role === 'ADMIN') {
  if (navAdmin) navAdmin.style.display = 'flex';
  if (navDashboard) navDashboard.href = 'admin.html';
}

document.querySelectorAll('#logout, #logout-danger').forEach(btn => {
  btn.addEventListener('click', () => {
    clearStoredUser();
    window.location.href = 'login.html';
  });
});

function initials(name) {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function setStatus(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `status ${type}`;
}

async function init() {
  // Load profile from backend
  const profile = await getProfile();

  // Sidebar
  avatarEl.textContent = initials(profile.name);
  nameEl.textContent = profile.name;
  if (roleEl) roleEl.textContent = profile.role;

  // Profile card
  document.getElementById('profile-avatar-big').textContent = initials(profile.name);
  document.getElementById('profile-display-name').textContent = profile.name;
  document.getElementById('profile-display-email').textContent = profile.email;
  document.getElementById('profile-role').innerHTML =
    `<span class="role-badge ${profile.role === 'ADMIN' ? 'admin' : 'student'}">${profile.role}</span>`;
  document.getElementById('profile-joined').textContent = formatDate(profile.createdAt);

  // Item count
  try {
    const items = await getItems();
    document.getElementById('profile-item-count').textContent = items.length;
  } catch {
    document.getElementById('profile-item-count').textContent = '—';
  }

  // Pre-fill form
  document.getElementById('edit-name').value = profile.name;
  document.getElementById('edit-email').value = profile.email;

  // Info form
  document.getElementById('info-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-name').value.trim();
    if (!name) return;
    try {
      const updated = await updateProfile({ name });
      // Update localStorage so sidebar reflects new name
      setStoredUser({ id: user.id, role: user.role, name: updated.name });
      avatarEl.textContent = initials(updated.name);
      nameEl.textContent = updated.name;
      document.getElementById('profile-avatar-big').textContent = initials(updated.name);
      document.getElementById('profile-display-name').textContent = updated.name;
      setStatus('info-status', '✓ Name updated successfully', 'success');
    } catch (err) {
      setStatus('info-status', err.message, 'error');
    }
  });

  // Password form
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    if (password !== confirm) {
      setStatus('password-status', 'Passwords do not match', 'error');
      return;
    }
    try {
      await updateProfile({ password });
      document.getElementById('password-form').reset();
      setStatus('password-status', '✓ Password updated successfully', 'success');
    } catch (err) {
      setStatus('password-status', err.message, 'error');
    }
  });
}

init().catch(err => console.error(err));
