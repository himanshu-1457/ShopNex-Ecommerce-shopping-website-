/* product-details.js - single product page (product.html?id=...) */

let selectedQuantity = 1; // quantity chosen by the user on this page

// Read ?id= from the address bar
function getProductIdFromUrl() {
  return Number(new URLSearchParams(window.location.search).get('id'));
}

// Shown when the id is missing or wrong
function renderNotFound() {
  document.getElementById('productDetails').innerHTML = `
    <div class="not-found">
      <h2>😕 Product not found</h2>
      <p>The product you are looking for does not exist.</p>
      <a href="products.html" class="btn btn-primary">Browse Products</a>
    </div>`;
}

// Build the whole product section
function renderProductDetails(product) {
  const savings = product.oldPrice - product.price;

  document.title = `${product.name} | SHOPNEX`;
  document.getElementById('breadcrumbCategory').textContent = product.category;
  document.getElementById('breadcrumbCategory').href = `products.html?category=${encodeURIComponent(product.category)}`;
  document.getElementById('breadcrumbName').textContent = product.name;

  document.getElementById('productDetails').innerHTML = `
    <div class="details-grid fade-in">
      <div class="details-image">
        ${product.emoji}
        <span class="discount-badge">-${getDiscountPercent(product)}% OFF</span>
      </div>

      <div class="details-info">
        <span class="product-category">${product.category}</span>
        <h1 class="details-title">${product.name}</h1>
        <div class="details-rating">★ ${product.rating} <span>(${product.reviews} reviews)</span></div>

        <div class="details-price">
          <strong>${formatPrice(product.price)}</strong>
          <del>${formatPrice(product.oldPrice)}</del>
          <span class="save">You save ${formatPrice(savings)}</span>
        </div>

        <p class="details-desc">${product.description}</p>
        <span class="stock">● In Stock</span>

        <div class="qty-row">
          <div class="qty-box">
            <button class="qty-btn" data-action="decrease" aria-label="Decrease quantity">−</button>
            <span class="qty-value" id="qtyValue">1</span>
            <button class="qty-btn" data-action="increase" aria-label="Increase quantity">+</button>
          </div>
          <div class="qty-total">Total: <strong id="qtyTotal">${formatPrice(product.price)}</strong></div>
        </div>

        <div class="details-actions">
          <button class="btn btn-primary" data-action="add-to-cart">🛒 Add to Cart</button>
          <button class="btn btn-outline" data-action="buy-now">Buy Now</button>
          <button class="btn btn-outline wish-btn" id="wishBtn" data-action="wishlist"></button>
        </div>

        <div class="perks">
          <div class="perk"><span>🚚</span>Free Delivery</div>
          <div class="perk"><span>↩️</span>7-Day Returns</div>
          <div class="perk"><span>🛡️</span>Quality Checked</div>
        </div>
      </div>
    </div>`;

  updateWishButton(product.id);
}

// Keep the wishlist button text in sync with Local Storage
function updateWishButton(productId) {
  const wishBtn = document.getElementById('wishBtn');
  const saved = isInWishlist(productId);
  wishBtn.classList.toggle('active', saved);
  wishBtn.textContent = saved ? '♥ In Wishlist' : '♡ Add to Wishlist';
}

// Refresh quantity number and total price after + / -
function updateQuantityDisplay(product) {
  document.getElementById('qtyValue').textContent = selectedQuantity;
  document.getElementById('qtyTotal').textContent = formatPrice(product.price * selectedQuantity);
}

// Handle every button on the page with one click listener
function bindDetailsEvents(product) {
  document.getElementById('productDetails').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    switch (button.dataset.action) {
      case 'increase':
        if (selectedQuantity < MAX_QUANTITY) {
          selectedQuantity++;
          updateQuantityDisplay(product);
        } else {
          showToast(`Maximum ${MAX_QUANTITY} units allowed per product`, 'error');
        }
        break;
      case 'decrease':
        if (selectedQuantity > 1) {
          selectedQuantity--;
          updateQuantityDisplay(product);
        }
        break;
      case 'add-to-cart':
        addToCart(product.id, selectedQuantity);
        break;
      case 'buy-now':
        addToCart(product.id, selectedQuantity);
        window.location.href = 'cart.html';
        break;
      case 'wishlist':
        toggleWishlist(product.id);
        updateWishButton(product.id);
        break;
    }
  });
}

// 4 related products: same category first, then fill with other products
function renderRelatedProducts(product) {
  const sameCategory = PRODUCTS.filter(item => item.category === product.category && item.id !== product.id);
  const others = PRODUCTS.filter(item => item.category !== product.category);
  const related = [...sameCategory, ...others].slice(0, 4);

  renderProductGrid(related, 'relatedGrid');
  bindProductCardEvents('relatedGrid');
}

document.addEventListener('DOMContentLoaded', () => {
  const product = getProductById(getProductIdFromUrl());

  if (!product) {
    renderNotFound();
    document.getElementById('relatedSection').hidden = true;
    return;
  }

  renderProductDetails(product);
  bindDetailsEvents(product);
  renderRelatedProducts(product);
});