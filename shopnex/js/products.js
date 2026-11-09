/* products.js - shared product card rendering (search/filter/sort added in Phase 4) */

// Discount % between old price and current price
function getDiscountPercent(product) {
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

// Build the HTML of one product card
function createProductCard(product) {
  const inWishlist = isInWishlist(product.id);
  const detailsLink = `product.html?id=${product.id}`;

  return `
    <article class="product-card">
      <div class="product-image">
        <a href="${detailsLink}" class="product-emoji" aria-label="View ${product.name}">${product.emoji}</a>
        <span class="discount-badge">-${getDiscountPercent(product)}%</span>
        <button class="wishlist-btn ${inWishlist ? 'active' : ''}" data-action="wishlist" data-id="${product.id}"
                aria-label="Toggle wishlist">${inWishlist ? '♥' : '♡'}</button>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name"><a href="${detailsLink}">${product.name}</a></h3>
        <div class="product-rating">★ ${product.rating} <span>(${product.reviews})</span></div>
        <div class="product-price">
          <strong>${formatPrice(product.price)}</strong>
          <del>${formatPrice(product.oldPrice)}</del>
        </div>
        <button class="btn btn-primary btn-sm btn-block" data-action="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    </article>`;
}

// Show a list of products inside the container with the given id
function renderProductGrid(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = products.length
    ? products.map(createProductCard).join('')
    : '<p class="empty-message">No products found.</p>';
}

// Event delegation: one listener handles every button inside the grid
function bindProductCardEvents(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    if (button.dataset.action === 'add-to-cart') {
      addToCart(button.dataset.id);
    }
    if (button.dataset.action === 'wishlist') {
      const added = toggleWishlist(button.dataset.id);
      button.classList.toggle('active', added);
      button.textContent = added ? '♥' : '♡';
    }
  });
}
/* =====================================================
   PRODUCTS PAGE: search, category filter, price sort
   (runs only when #productsGrid exists on the page)
   ===================================================== */

// Current filter settings of the page
const shopState = { search: '', category: 'All', sort: 'default' };

// Apply search + category + sort and return the matching products
function getFilteredProducts() {
  const searchTerm = shopState.search.trim().toLowerCase();

  const result = PRODUCTS.filter(product => {
    const matchesCategory = shopState.category === 'All' || product.category === shopState.category;
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  // filter() gives a new array, so sorting here does not change PRODUCTS
  switch (shopState.sort) {
    case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
  }
  return result;
}

// Text like: 3 products in Shoes for "run"
function buildResultsText(count) {
  let text = `${count} ${count === 1 ? 'product' : 'products'}`;
  if (shopState.category !== 'All') text += ` in ${shopState.category}`;
  if (shopState.search.trim()) text += ` for “${shopState.search.trim()}”`;
  return text;
}

// Keep the address bar in sync (?category=Shoes&search=run) so links can be shared
function syncShopUrl() {
  const params = new URLSearchParams();
  if (shopState.category !== 'All') params.set('category', shopState.category);
  if (shopState.search.trim()) params.set('search', shopState.search.trim());
  const query = params.toString();
  try {
    history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  } catch (error) {
    /* some browsers block this on file:// - safe to ignore */
  }
}

// "All" chip + one chip per category
function renderCategoryChips() {
  const chipsBox = document.getElementById('categoryChips');
  const names = ['All', ...CATEGORIES.map(category => category.name)];
  chipsBox.innerHTML = names
    .map(name => `<button class="chip" data-category="${name}">${name}</button>`)
    .join('');
}

// Redraw everything that depends on the filters
function updateShop() {
  const products = getFilteredProducts();

  if (products.length) {
    renderProductGrid(products, 'productsGrid');
  } else {
    document.getElementById('productsGrid').innerHTML = `
      <div class="empty-message">
        <p>😕 No products match your search.</p>
        <button class="btn btn-outline btn-sm" data-action="clear-filters">Clear filters</button>
      </div>`;
  }

  document.getElementById('resultsText').textContent = buildResultsText(products.length);

  document.querySelectorAll('.chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.category === shopState.category);
  });

  // Show "Clear filters" only when something is applied
  const filtersApplied = shopState.category !== 'All' || shopState.search.trim() || shopState.sort !== 'default';
  document.getElementById('clearFilters').hidden = !filtersApplied;

  syncShopUrl();
}

// Reset search, category and sort
function clearShopFilters() {
  shopState.search = '';
  shopState.category = 'All';
  shopState.sort = 'default';
  document.getElementById('shopSearchInput').value = '';
  document.getElementById('sortSelect').value = 'default';
  const navInput = document.getElementById('navSearchInput');
  if (navInput) navInput.value = '';
  updateShop();
}

function initProductsPage() {
  if (!document.getElementById('productsGrid')) return; // not the products page

  // Read ?category= and ?search= from the URL (set by navbar search / footer / home links)
  const params = new URLSearchParams(window.location.search);
  const urlCategory = params.get('category');
  shopState.category = CATEGORIES.some(category => category.name === urlCategory) ? urlCategory : 'All';
  shopState.search = params.get('search') || '';

  renderCategoryChips();

  // Show the search term in both search boxes
  const searchInput = document.getElementById('shopSearchInput');
  searchInput.value = shopState.search;
  const navInput = document.getElementById('navSearchInput');
  if (navInput) navInput.value = shopState.search;

  // Live search while typing
  searchInput.addEventListener('input', () => {
    shopState.search = searchInput.value;
    updateShop();
  });

  // Category chips
  document.getElementById('categoryChips').addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    shopState.category = chip.dataset.category;
    updateShop();
  });

  // Price / rating sorting
  document.getElementById('sortSelect').addEventListener('change', (event) => {
    shopState.sort = event.target.value;
    updateShop();
  });

  // Both "Clear filters" buttons (toolbar + empty state)
  document.getElementById('clearFilters').addEventListener('click', clearShopFilters);
  document.getElementById('productsGrid').addEventListener('click', (event) => {
    if (event.target.closest('[data-action="clear-filters"]')) clearShopFilters();
  });

  bindProductCardEvents('productsGrid'); // add-to-cart + wishlist buttons
  updateShop();
}

document.addEventListener('DOMContentLoaded', initProductsPage);