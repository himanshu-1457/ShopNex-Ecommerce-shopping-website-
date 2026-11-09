/* cart-page.js - draws the cart page and handles its buttons */

// One cart row
function createCartItemHTML({ product, quantity, lineTotal }) {
  return `
    <article class="cart-item">
      <a href="product.html?id=${product.id}" class="cart-item-image">${product.emoji}</a>
      <div class="cart-item-info">
        <span class="product-category">${product.category}</span>
        <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
        <span class="cart-item-price">${formatPrice(product.price)} each</span>
      </div>
      <div class="cart-qty">
        <button data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">−</button>
        <span>${quantity}</span>
        <button data-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item-total">${formatPrice(lineTotal)}</div>
      <button class="remove-btn" data-action="remove" data-id="${product.id}" aria-label="Remove ${product.name}">🗑️</button>
    </article>`;
}

// Coupon input, or the "applied" tag if a coupon is active
function createCouponHTML(totals) {
  if (totals.couponCode) {
    return `
      <div class="coupon-applied">
        <span>🎟️ ${totals.couponCode} applied</span>
        <button data-action="remove-coupon">Remove</button>
      </div>`;
  }
  return `
    <div class="coupon-form">
      <input type="text" id="couponInput" placeholder="Coupon code" aria-label="Coupon code">
      <button class="btn btn-outline btn-sm" data-action="apply-coupon">Apply</button>
    </div>
    <p class="coupon-hint">Try: SHOPNEX10 or WELCOME200</p>`;
}

// Order summary card
function createSummaryHTML(totals) {
  return `
    <aside class="cart-summary">
      <h3>Order Summary</h3>
      <div class="coupon-box">${createCouponHTML(totals)}</div>
      <div class="summary-row"><span>Subtotal (${totals.itemCount} items)</span><span>${formatPrice(totals.subtotal)}</span></div>
      ${totals.discount > 0
        ? `<div class="summary-row discount"><span>Discount</span><span>−${formatPrice(totals.discount)}</span></div>`
        : ''}
      <div class="summary-row"><span>Delivery</span><span class="text-purple">FREE</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(totals.total)}</span></div>
      <a href="checkout.html" class="btn btn-primary btn-block">Proceed to Checkout</a>
      <a href="products.html" class="continue-link">← Continue Shopping</a>
    </aside>`;
}

// Redraw the whole page from Local Storage (called after every change)
function renderCartPage() {
  const totals = getCartTotals();
  const content = document.getElementById('cartContent');

  if (totals.items.length === 0) {
    content.innerHTML = `
      <div class="empty-cart fade-in">
        <span class="empty-icon">🛒</span>
        <h2>Your cart is empty</h2>
        <p>Looks like you have not added anything yet.</p>
        <a href="products.html" class="btn btn-primary">Start Shopping</a>
      </div>`;
    return;
  }

  content.innerHTML = `
    <div class="cart-layout fade-in">
      <section>
        <div class="cart-list-head">
          <span>${totals.items.length} ${totals.items.length === 1 ? 'product' : 'products'} in your cart</span>
          <button class="clear-btn" data-action="clear-cart">Clear cart</button>
        </div>
        ${totals.items.map(createCartItemHTML).join('')}
      </section>
      ${createSummaryHTML(totals)}
    </div>`;
}

function handleApplyCoupon() {
  const input = document.getElementById('couponInput');
  const result = applyCoupon(input ? input.value : '');
  showToast(result.message, result.success ? 'success' : 'error');
  if (result.success) renderCartPage();
}

// One click listener for every button on the page
function bindCartEvents() {
  const content = document.getElementById('cartContent');

  content.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const productId = button.dataset.id;

    switch (button.dataset.action) {
      case 'increase':      changeQuantity(productId, 1); break;
      case 'decrease':      changeQuantity(productId, -1); break;
      case 'remove':        removeFromCart(productId); break;
      case 'apply-coupon':  handleApplyCoupon(); return; // renders by itself
      case 'remove-coupon': removeCoupon(); showToast('Coupon removed'); break;
      case 'clear-cart':
        if (!window.confirm('Remove all items from your cart?')) return;
        clearCart();
        showToast('Cart cleared');
        break;
    }
    renderCartPage();
  });

  // Press Enter inside the coupon box to apply
  content.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.id === 'couponInput') handleApplyCoupon();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  bindCartEvents();
});