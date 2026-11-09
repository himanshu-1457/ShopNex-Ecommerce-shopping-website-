/* order-success.js - shows the receipt saved by checkout.js */

function formatOrderDate(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderOrderSuccess() {
  const content = document.getElementById('successContent');
  const order = getFromStorage(STORAGE_KEYS.lastOrder);

  // Someone opened this page directly without ordering
  if (!order) {
    content.innerHTML = `
      <div class="empty-cart fade-in">
        <span class="empty-icon">📦</span>
        <h2>No recent order found</h2>
        <p>Place an order and your receipt will appear here.</p>
        <a href="products.html" class="btn btn-primary">Start Shopping</a>
      </div>`;
    return;
  }

  // Estimated delivery = 5 days after the order date
  const orderDate = new Date(order.date);
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const itemsHTML = order.items.map(item => `
    <div class="summary-item">
      <span class="summary-item-emoji">${item.emoji}</span>
      <div class="summary-item-info">${item.name}<small>${formatPrice(item.price)} × ${item.quantity}</small></div>
      <span class="summary-item-price">${formatPrice(item.lineTotal)}</span>
    </div>`).join('');

  // User-typed text goes through escapeHTML so it can never break the page
  content.innerHTML = `
    <div class="success-wrap fade-in">
      <div class="success-check">✓</div>
      <h1>Order <span class="text-purple">Confirmed!</span></h1>
      <p>Thank you, ${escapeHTML(order.customer.name.split(' ')[0])}. Your demo order has been placed.</p>
      <div class="order-id">Order ID: ${order.orderId}</div>

      <div class="success-grid">
        <div class="success-card">
          <h3>📍 Delivery Address</h3>
          <p><strong>${escapeHTML(order.customer.name)}</strong></p>
          <p>${escapeHTML(order.address.line)}</p>
          <p>${escapeHTML(order.address.city)}, ${escapeHTML(order.address.state)} - ${escapeHTML(order.address.pincode)}</p>
          <p>📞 ${escapeHTML(order.customer.phone)}</p>
        </div>
        <div class="success-card">
          <h3>🚚 Order Details</h3>
          <p>Order date: <strong>${formatOrderDate(orderDate)}</strong></p>
          <p>Estimated delivery: <strong>${formatOrderDate(deliveryDate)}</strong></p>
          <p>Email: <strong>${escapeHTML(order.customer.email)}</strong></p>
          <p>Status: <strong class="text-purple">Order Placed (Demo)</strong></p>
        </div>
      </div>

      <div class="success-card success-items">
        <h3>🧾 Order Summary</h3>
        ${itemsHTML}
        <div class="summary-row"><span>Subtotal (${order.itemCount} items)</span><span>${formatPrice(order.subtotal)}</span></div>
        ${order.discount > 0
          ? `<div class="summary-row discount"><span>Discount (${order.couponCode})</span><span>−${formatPrice(order.discount)}</span></div>`
          : ''}
        <div class="summary-row"><span>Delivery</span><span class="text-purple">FREE</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatPrice(order.total)}</span></div>
      </div>

      <p class="demo-note">🔒 This is a demo order for a college project. No payment was taken.</p>

      <div class="success-actions">
        <a href="products.html" class="btn btn-primary">Continue Shopping</a>
        <button class="btn btn-outline" id="printBtn">🖨️ Print Receipt</button>
        <a href="index.html" class="btn btn-outline">Go to Home</a>
      </div>
    </div>`;

  document.getElementById('printBtn').addEventListener('click', () => window.print());
}

document.addEventListener('DOMContentLoaded', renderOrderSuccess);