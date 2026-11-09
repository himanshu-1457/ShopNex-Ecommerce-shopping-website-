/* auth.js - login and registration using Local Storage */

/* ---------- Helpers ---------- */

// Hash a password with SHA-256 so it is never stored as plain text.
// (crypto.subtle works on localhost / Live Server; the fallback is a basic hash.)
async function hashPassword(password) {
  if (window.crypto && window.crypto.subtle) {
    const bytes = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) hash = (hash * 31 + password.charCodeAt(i)) | 0;
  return 'basic' + hash;
}

function getUsers() {
  return getFromStorage(STORAGE_KEYS.users, []);
}

function findUserByEmail(email) {
  return getUsers().find(user => user.email === email);
}

// After login, go back to the page that asked for it (?redirect=checkout.html), else homepage
function getRedirectTarget() {
  const target = new URLSearchParams(window.location.search).get('redirect');
  return target && /^[a-z-]+\.html$/.test(target) ? target : 'index.html'; // only local pages allowed
}

// Save the logged-in user (never store the password hash in the session)
function startSession(user, message) {
  saveToStorage(STORAGE_KEYS.currentUser, { id: user.id, name: user.name, email: user.email });
  showToast(message, 'success');
  setTimeout(() => { window.location.href = getRedirectTarget(); }, 900);
}

/* ---------- Validation (each returns an error text, or '' if valid) ---------- */

function validateName(name) {
  if (name.length < 2) return 'Please enter your full name';
  return '';
}

function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return '';
}

function validatePassword(password) {
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Use at least one letter and one number';
  return '';
}

/* ---------- Form UI helpers ---------- */

// Show or clear the error under a field. Returns true when the field is valid.
function setFieldError(inputId, message) {
  document.getElementById(inputId).classList.toggle('invalid', Boolean(message));
  document.getElementById(inputId + 'Error').textContent = message;
  return !message;
}

function getValue(inputId) {
  return document.getElementById(inputId).value;
}

// Switch between the "login" and "register" tabs
function switchTab(tabName) {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  document.getElementById('loginPanel').hidden = tabName !== 'login';
  document.getElementById('registerPanel').hidden = tabName !== 'register';
}

/* ---------- Submit handlers ---------- */

async function handleRegister(event) {
  event.preventDefault();
  const name = getValue('regName').trim();
  const email = getValue('regEmail').trim().toLowerCase();
  const password = getValue('regPassword');
  const confirmPassword = getValue('regConfirm');

  // Every field is checked (array keeps all messages visible at once)
  const results = [
    setFieldError('regName', validateName(name)),
    setFieldError('regEmail', validateEmail(email)),
    setFieldError('regPassword', validatePassword(password)),
    setFieldError('regConfirm', password === confirmPassword ? '' : 'Passwords do not match')
  ];
  if (results.includes(false)) return;

  if (findUserByEmail(email)) {
    setFieldError('regEmail', 'This email is already registered. Please login.');
    return;
  }

  const button = event.target.querySelector('button[type="submit"]');
  button.disabled = true; // stop double clicks while hashing

  const newUser = {
    id: Date.now(),
    name,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString()
  };
  saveToStorage(STORAGE_KEYS.users, [...getUsers(), newUser]);
  startSession(newUser, `Welcome to SHOPNEX, ${name.split(' ')[0]}! 🎉`);
}

async function handleLogin(event) {
  event.preventDefault();
  const email = getValue('loginEmail').trim().toLowerCase();
  const password = getValue('loginPassword');

  const results = [
    setFieldError('loginEmail', validateEmail(email)),
    setFieldError('loginPassword', password ? '' : 'Please enter your password')
  ];
  if (results.includes(false)) return;

  const user = findUserByEmail(email);
  const passwordHash = await hashPassword(password);

  // Same message for wrong email or wrong password (does not reveal which one is wrong)
  if (!user || user.passwordHash !== passwordHash) {
    setFieldError('loginPassword', 'Incorrect email or password');
    return;
  }

  event.target.querySelector('button[type="submit"]').disabled = true;
  startSession(user, `Welcome back, ${user.name.split(' ')[0]}! 👋`);
}

/* ---------- Start ---------- */

document.addEventListener('DOMContentLoaded', () => {
  // Already logged in? No need to see this page (logout is in the navbar)
  if (getFromStorage(STORAGE_KEYS.currentUser)) {
    window.location.href = getRedirectTarget();
    return;
  }

  // Open the register tab for links like login.html?tab=register
  const startTab = new URLSearchParams(window.location.search).get('tab');
  switchTab(startTab === 'register' ? 'register' : 'login');

  // Tab buttons and the "Don't have an account?" links
  document.querySelector('.auth-card').addEventListener('click', (event) => {
    const tabButton = event.target.closest('[data-tab]');
    if (tabButton) switchTab(tabButton.dataset.tab);

    // Show / hide password
    const toggle = event.target.closest('.password-toggle');
    if (toggle) {
      const input = document.getElementById(toggle.dataset.target);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.textContent = show ? '🙈' : '👁️';
    }
  });

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);

  // Remove a field's error as soon as the user edits it
  document.querySelectorAll('.auth-card input').forEach(input => {
    input.addEventListener('input', () => setFieldError(input.id, ''));
  });
});