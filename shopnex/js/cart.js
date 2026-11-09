/* cart.js - core cart functions (cart page + remove/quantity/total come in Phase 6) */

const MAX_QUANTITY = 10; // maximum units of one product in cart

function getCart() {
  return getFromStorage(STORAGE_KEYS.cart, []);
}

// Save cart and refresh the navbar badge
function saveCart(cart) {
  saveToStorage(STORAGE_KEYS.cart, cart);
  updateBadges();
}

// Add a product to cart; if it already exists, increase its quantity
function addToCart(productId, quantity = 1) {
  const id = Number(productId);
  if (!getProductById(id)) return;

  const cart = getCart();
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    if (existingItem.quantity >= MAX_QUANTITY) {
      showToast(`Maximum ${MAX_QUANTITY} units allowed per product`, 'error');
      return;
    }
    existingItem.quantity = Math.min(existingItem.quantity + quantity, MAX_QUANTITY);
  } else {
    cart.push({ id, quantity });
  }

  saveCart(cart);
  showToast('Added to cart 🛒', 'success');
}
/* =====================================================
   CART LOGIC (Phase 6): remove, quantity, coupon, totals
   ===================================================== */

// Available coupons (demo). minOrder = minimum cart subtotal needed
const COUPONS = {
  SHOPNEX10:  { type: 'percent', value: 10,  minOrder: 0,    label: '10% off' },
  WELCOME200: { type: 'flat',    value: 200, minOrder: 1000, label: '₹200 off on orders above ₹1,000' }
};

// Cart rows joined with full product data: [{ product, quantity, lineTotal }]
function getCartItems() {
  return getCart()
    .map(item => {
      const product = getProductById(item.id);
      return product ? { product, quantity: item.quantity, lineTotal: product.price * item.quantity } : null;
    })
    .filter(Boolean); // skip products that no longer exist
}

function removeFromCart(productId) {
  saveCart(getCart().filter(item => item.id !== Number(productId)));
  showToast('Item removed from cart');
}

// change = +1 or -1
function changeQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find(cartItem => cartItem.id === Number(productId));
  if (!item) return;

  const newQuantity = item.quantity + change;
  if (newQuantity > MAX_QUANTITY) {
    showToast(`Maximum ${MAX_QUANTITY} units allowed per product`, 'error');
    return;
  }
  if (newQuantity < 1) return; // use the remove button to delete an item

  item.quantity = newQuantity;
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
  removeFromStorage(STORAGE_KEYS.coupon);
}

// Validate and save a coupon. Returns { success, message }
function applyCoupon(rawCode) {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { success: false, message: 'Please enter a coupon code' };

  const coupon = COUPONS[code];
  if (!coupon) return { success: false, message: 'Invalid coupon code' };

  const subtotal = getCartItems().reduce((sum, item) => sum + item.lineTotal, 0);
  if (subtotal < coupon.minOrder) {
    return { success: false, message: `Add items worth ${formatPrice(coupon.minOrder)} or more to use this coupon` };
  }

  saveToStorage(STORAGE_KEYS.coupon, code);
  return { success: true, message: `Coupon ${code} applied` };
}

function removeCoupon() {
  removeFromStorage(STORAGE_KEYS.coupon);
}

// All amounts in one object (used by cart page now, checkout page later)
function getCartTotals() {
  const items = getCartItems();
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  let couponCode = getFromStorage(STORAGE_KEYS.coupon);
  const coupon = couponCode ? COUPONS[couponCode] : null;
  let discount = 0;

  if (coupon && subtotal > 0 && subtotal >= coupon.minOrder) {
    discount = coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);
  } else if (couponCode) {
    // Cart changed and coupon is no longer valid, so drop it
    removeCoupon();
    couponCode = null;
  }

  const delivery = 0; // free delivery on all orders
  return { items, itemCount, subtotal, discount, couponCode, delivery, total: subtotal - discount + delivery };
}