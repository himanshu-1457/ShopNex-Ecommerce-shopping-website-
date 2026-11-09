/* wishlist-page.js - draws the wishlist page and handles its buttons */

// Saved ids -> full product objects (ignores ids of products that no longer exist)
function getWishlistProducts() {
  return getWishlist().map(id => getProductById(id)).filter(Boolean);
}

// Reuse the normal product card, but rename its button to "Move to Cart"
function createWishlistCard(product) {
  return createProductCard(product).replace('>Add to Cart<', '>Move to Cart<');
}

// Redraw the page from Local Storage (called after every change)
function renderWishlistPage() {
  const products = getWishlistProducts();
  const content = document.getElementById('wishlistContent');

  if (products.length === 0) {
    content.innerHTML = `
      <div class="empty-cart fade-in">
        <span class="empty-icon">💜</span>
        <h2>Your wishlist is empty</h2>
        <p>Tap the ♡ on any product to save it here for later.</p>
        <a href="products.html" class="btn btn-primary">Explore Products</a>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div class="results-bar">
      <span>${products.length} ${products.length === 1 ? 'item' : 'items'} saved</span>
      <div class="bar-actions">
        <button class="btn btn-primary btn-sm" data-action="move-all">Move all to cart</button>
        <button class="clear-btn" data-action="clear-wishlist">✕ Clear wishlist</button>
      </div>
    </div>
    <div class="product-grid fade-in">
      ${products.map(createWishlistCard).join('')}
    </div>`;
}

// Move every saved product to the cart (1 unit each) and empty the wishlist
function moveAllToCart() {
  const products = getWishlistProducts();
  const cart = getCart();

  products.forEach(product => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + 1, MAX_QUANTITY);
    } else {
      cart.push({ id: product.id, quantity: 1 });
    }
  });

  saveCart(cart);
  clearWishlist();
  showToast(`${products.length} items moved to cart 🛒`, 'success');
}

// One click listener for every button on the page
function bindWishlistEvents() {
  document.getElementById('wishlistContent').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const productId = button.dataset.id;

    switch (button.dataset.action) {
      case 'wishlist':        // the ♥ on a card = remove from wishlist
        removeFromWishlist(productId);
        showToast('Removed from wishlist');
        break;
      case 'add-to-cart':     // "Move to Cart" button
        removeFromWishlist(productId);
        addToCart(productId);
        break;
      case 'move-all':
        moveAllToCart();
        break;
      case 'clear-wishlist':
        if (!window.confirm('Remove all items from your wishlist?')) return;
        clearWishlist();
        showToast('Wishlist cleared');
        break;
    }
    renderWishlistPage();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderWishlistPage();
  bindWishlistEvents();
});