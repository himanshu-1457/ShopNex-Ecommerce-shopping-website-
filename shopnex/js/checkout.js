/* checkout.js - delivery form, order summary and placing the demo order */

/* ---------- Validation rules (each returns an error text, or '' if valid) ---------- */
const checkoutValidators = {
  coName:    value => value.length < 2 ? 'Please enter your full name' : '',
  coPhone:   value => /^[6-9]\d{9}$/.test(value) ? '' : 'Enter a valid 10-digit mobile number',
  coEmail:   value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address',
  coAddress: value => value.length < 10 ? 'Enter full address (house no, street, area)' : '',
  coCity:    value => value.length < 2 ? 'Please enter your city' : '',
  coState:   value => value.length < 2 ? 'Please enter your state' : '',
  coPincode: value => /^\d{6}$/.test(value) ? '' : 'Enter a valid 6-digit PIN code'
};

// Show or clear the error under a field. Returns true when the field is valid.
function setCheckoutError(inputId, message) {
  document.getElementById(inputId).classList.toggle('invalid', Boolean(message));
  document.getElementById(inputId + 'Error').textContent = message;
  return !message;
}

// Check every field, show all errors, focus the first wrong one
function validateCheckoutForm() {
  let firstInvalidId = null;
  Object.keys(checkoutValidators).forEach(fieldId => {
    const value = document.getElementById(fieldId).value.trim();
    const isValid = setCheckoutError(fieldId, checkoutValidators[fieldId](value));
    if (!isValid && !firstInvalidId) firstInvalidId = fieldId;
  });
  if (firstInvalidId) document.getElementById(firstInvalidId).focus();
  return !firstInvalidId;
}

/* ---------- Rendering ---------- */

function createCheckoutFormHTML(user) {
  return `
    <section class="checkout-card">
      <h3>Delivery Details</h3>
      <p class="sub">Where should we deliver your order?</p>
      <form id="checkoutForm" novalidate>
        <div class="form-row-2">
          <div class="form-group">
            <label for="coName">Full name</label>
            <input type="text" id="coName" value="${escapeHTML(user.name || '')}" autocomplete="name">
            <span class="field-error" id="coNameError"></span>
          </div>
          <div class="form-group">
            <label for="coPhone">Mobile number</label>
            <input type="tel" id="coPhone" maxlength="10" placeholder="10-digit number" autocomplete="tel">
            <span class="field-error" id="coPhoneError"></span>
          </div>
        </div>
        <div class="form-group">
          <label for="coEmail">Email</label>
          <input type="email" id="coEmail" value="${escapeHTML(user.email || '')}" autocomplete="email">
          <span class="field-error" id="coEmailError"></span>
        </div>
        <div class="form-group">
          <label for="coAddress">Address</label>
          <textarea id="coAddress" placeholder="House no, street, area, landmark" autocomplete="street-address"></textarea>
          <span class="field-error" id="coAddressError"></span>
        </div>
        <div class="form-row-3">
          <div class="form-group">
            <label for="coCity">City</label>
            <input type="text" id="coCity" autocomplete="address-level2">
            <span class="field-error" id="coCityError"></span>
          </div>
          <div class="form-group">
            <label for="coState">State</label>
            <input type="text" id="coState" autocomplete="address-level1">
            <span class="field-error" id="coStateError"></span>
          </div>
          <div class="form-group">
            <label for="coPincode">PIN code</label>
            <input type="text" id="coPincode" maxlength="6" inputmode="numeric" autocomplete="postal-code">
            <span class="field-error" id="coPincodeError"></span>
          </div>
        </div>
      </form>
    </section>`;
}

function createCheckoutSummaryHTML(totals) {
  const itemsHTML = totals.items.map(({ product, quantity, lineTotal }) => `
    <div class="summary-item">
      <span class="summary-item-emoji">${product.emoji}</span>
      <div class="summary-item-info">${product.name}<small>Qty: ${quantity}</small></div>
      <span class="summary-item-price">${formatPrice(lineTotal)}</span>
    </div>`).join('');

  return `
    <aside class="cart-summary">
      <h3>Order Summary</h3>
      <div class="summary-items">${itemsHTML}</div>
      <div class="summary-row"><span>Subtotal (${totals.itemCount} items)</span><span>${formatPrice(totals.subtotal)}</span></div>
      ${totals.discount > 0
        ? `<div class="summary-row discount"><span>Discount (${totals.couponCode})</span><span>−${formatPrice(totals.discount)}</span></div>`
        : ''}
      <div class="summary-row"><span>Delivery</span><span class="text-purple">FREE</span></div>
      <div class="summary-row total"><span>Total</span><span>${formatPrice(totals.total)}</span></div>
      <button type="submit" form="checkoutForm" class="btn btn-primary btn-block" id="placeOrderBtn">Place Demo Order</button>
      <a href="cart.html" class="continue-link">← Back to Cart</a>
      <p class="demo-note">🔒 Demo project: no payment is taken and no real order is placed.</p>
    </aside>`;
}

/* ---------- Placing the order ---------- */

// Example: SHN-LX4K9Q2A
function generateOrderId() {
  return 'SHN-' + Date.now().toString(36).toUpperCase();
}

// Build the order object from the form + cart, then save it
function placeOrder(user) {
  const totals = getCartTotals();
  if (totals.items.length === 0) return; // cart was emptied in another tab

  const fieldValue = id => document.getElementById(id).value.trim();

  const order = {
    orderId: generateOrderId(),
    date: new Date().toISOString(),
    userId: user.id,
    customer: { name: fieldValue('coName'), email: fieldValue('coEmail'), phone: fieldValue('coPhone') },
    address: { line: fieldValue('coAddress'), city: fieldValue('coCity'), state: fieldValue('coState'), pincode: fieldValue('coPincode') },
    // Snapshot of the items, so the receipt stays correct even if product data changes later
    items: totals.items.map(({ product, quantity, lineTotal }) => ({
      id: product.id, name: product.name, emoji: product.emoji, price: product.price, quantity, lineTotal
    })),
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    discount: totals.discount,
    couponCode: totals.couponCode,
    delivery: totals.delivery,
    total: totals.total
  };

  saveToStorage(STORAGE_KEYS.lastOrder, order);
  clearCart(); // empties the cart and removes the coupon
  window.location.href = 'order-success.html';
}

/* ---------- Start ---------- */

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('checkoutContent');

  // 1) Login is required
  const user = getFromStorage(STORAGE_KEYS.currentUser);
  if (!user) {
    window.location.href = 'login.html?redirect=checkout.html';
    return;
  }

  // 2) Nothing to check out
  const totals = getCartTotals();
  if (totals.items.length === 0) {
    content.innerHTML = `
      <div class="empty-cart fade-in">
        <span class="empty-icon">🛒</span>
        <h2>Your cart is empty</h2>
        <p>Add some products before checking out.</p>
        <a href="products.html" class="btn btn-primary">Start Shopping</a>
      </div>`;
    return;
  }

  // 3) Show form + summary
  content.innerHTML = `
    <div class="cart-layout fade-in">
      ${createCheckoutFormHTML(user)}
      ${createCheckoutSummaryHTML(totals)}
    </div>`;

  const form = document.getElementById('checkoutForm');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateCheckoutForm()) {
      showToast('Please fix the highlighted fields', 'error');
      return;
    }
    document.getElementById('placeOrderBtn').disabled = true; // stop double orders
    placeOrder(user);
  });

  // Clear a field's error as the user types; allow only digits in phone and PIN
  form.addEventListener('input', (event) => {
    if (event.target.id === 'coPhone' || event.target.id === 'coPincode') {
      event.target.value = event.target.value.replace(/\D/g, '');
    }
    if (event.target.id) setCheckoutError(event.target.id, '');
  });
});