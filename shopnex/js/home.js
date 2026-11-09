/* home.js - builds the homepage sections */

// Category cards -> each links to products.html?category=Name
function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;

  grid.innerHTML = CATEGORIES.map(category => `
    <a href="products.html?category=${encodeURIComponent(category.name)}" class="category-card">
      <span class="category-emoji">${category.emoji}</span>
      <h3>${category.name}</h3>
      <p>${category.description}</p>
      <span class="category-count">${getProductsByCategory(category.name).length} products</span>
    </a>`).join('');
}

// Featured (4) and trending (4, excluding the featured ones so nothing repeats)
function renderHomeProducts() {
  const featuredProducts = PRODUCTS.filter(product => product.featured).slice(0, 4);
  const trendingProducts = PRODUCTS
    .filter(product => product.trending && !featuredProducts.includes(product))
    .slice(0, 4);

  renderProductGrid(featuredProducts, 'featuredGrid');
  renderProductGrid(trendingProducts, 'trendingGrid');
}

// Hide the "Join" banner if a user is already logged in
function toggleJoinBanner() {
  const banner = document.getElementById('joinBanner');
  if (banner && getFromStorage(STORAGE_KEYS.currentUser)) banner.hidden = true;
}

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderHomeProducts();
  bindProductCardEvents('featuredGrid');
  bindProductCardEvents('trendingGrid');
  toggleJoinBanner();
});