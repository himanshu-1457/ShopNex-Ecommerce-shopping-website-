/* ui.js - shared UI: header, footer, toast, badges */

// 7999 -> ₹7,999
function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// Prevents HTML injection when showing user-typed text
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- Toast notifications ---------- */
// type: 'info' | 'success' | 'error'
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Auto-hide after 2.8 seconds, then remove from DOM
  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2800);
}

/* ---------- Navbar badges ---------- */
function getCartCount() {
  const cart = getFromStorage(STORAGE_KEYS.cart, []);
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getWishlistCount() {
  return getFromStorage(STORAGE_KEYS.wishlist, []).length;
}

function setBadge(badgeId, count) {
  const badge = document.getElementById(badgeId);
  if (!badge) return;
  badge.textContent = count;
  badge.hidden = count === 0;
}

// Call this whenever cart or wishlist changes
function updateBadges() {
  setBadge('cartBadge', getCartCount());
  setBadge('wishlistBadge', getWishlistCount());
}

/* ---------- Header ---------- */
function renderHeader() {
  const target = document.getElementById('site-header');
  if (!target) return;

  // Show Login button, or user name + Logout if someone is logged in
  const user = getFromStorage(STORAGE_KEYS.currentUser);
  const userArea = user
    ? `<span class="user-name">Hi, ${escapeHTML((user.name || 'User').split(' ')[0])}</span>
       <button class="btn btn-outline btn-sm" id="logoutBtn">Logout</button>`
    : `<a href="login.html" class="btn btn-primary btn-sm">Login</a>`;

  target.innerHTML = `
    <header class="navbar">
      <div class="container navbar-inner">
        <a href="index.html" class="logo">SHOP<span>NEX</span></a>

        <div class="nav-menu" id="navMenu">
          <ul class="nav-links">
            <li><a href="index.html" data-page="index.html">Home</a></li>
            <li><a href="products.html" data-page="products.html">Products</a></li>
            <li><a href="index.html#categories">Categories</a></li>
          </ul>
          <form class="nav-search" id="navSearchForm">
            <input type="search" id="navSearchInput" placeholder="Search products..." aria-label="Search products">
            <button type="submit" aria-label="Search">🔍</button>
          </form>
        </div>

        <div class="nav-actions">
          <a href="wishlist.html" class="nav-icon" aria-label="Wishlist">♡<span class="badge" id="wishlistBadge" hidden>0</span></a>
          <a href="cart.html" class="nav-icon" aria-label="Cart">🛒<span class="badge" id="cartBadge" hidden>0</span></a>
          ${userArea}
          <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu">☰</button>
        </div>
      </div>
    </header>`;

  highlightActiveLink();
  bindHeaderEvents();
  updateBadges();
}

// Underline the link of the page currently open
function highlightActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === currentPage);
  });
}

function bindHeaderEvents() {
  // Mobile menu open/close
  const menu = document.getElementById('navMenu');
  document.getElementById('menuToggle').addEventListener('click', () => menu.classList.toggle('open'));

  // Close the mobile menu after a link is tapped (useful for the #categories link)
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) menu.classList.remove('open');
  });

  // Search -> products page with ?search=term
  document.getElementById('navSearchForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const searchTerm = document.getElementById('navSearchInput').value.trim();
    window.location.href = searchTerm
      ? `products.html?search=${encodeURIComponent(searchTerm)}`
      : 'products.html';
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      removeFromStorage(STORAGE_KEYS.currentUser);

      // Checkout needs a logged-in user, so leave that page
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'checkout.html') {
        window.location.href = 'index.html';
        return;
      }
      renderHeader();
      showToast('You have been logged out', 'success');
    });
  }
}

/* ---------- Footer ---------- */
function renderFooter() {
  const target = document.getElementById('site-footer');
  if (!target) return;

  target.innerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <a href="index.html" class="logo">SHOP<span>NEX</span></a>
            <p>Premium shopping for electronics, fashion, shoes and accessories.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><a href="products.html?category=Electronics">Electronics</a></li>
              <li><a href="products.html?category=Fashion">Fashion</a></li>
              <li><a href="products.html?category=Shoes">Shoes</a></li>
              <li><a href="products.html?category=Accessories">Accessories</a></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><a href="login.html">Login / Register</a></li>
              <li><a href="cart.html">My Cart</a></li>
              <li><a href="wishlist.html">Wishlist</a></li>
            </ul>
          </div>
          <div>
            <h4>About</h4>
            <p>BCA College Project<br>IAMR Group of Institutions</p>
          </div>
        </div>
        <div class="footer-bottom">
          © ${new Date().getFullYear()} SHOPNEX. Demo project, no real payments or orders.
        </div>
      </div>
    </footer>`;
}

/* ---------- Start ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
});