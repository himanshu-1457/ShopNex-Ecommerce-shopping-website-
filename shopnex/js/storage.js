/* storage.js - safe helpers for Local Storage */

// All Local Storage keys in one place (avoids spelling mistakes)
const STORAGE_KEYS = {
  cart: 'shopnex_cart',
  wishlist: 'shopnex_wishlist',
  users: 'shopnex_users',
  currentUser: 'shopnex_current_user',
  lastOrder: 'shopnex_last_order',
  coupon: 'shopnex_coupon'   // <-- NEW (applied coupon code)
};

// Read and parse data; returns fallback if key is missing or data is corrupted
function getFromStorage(key, fallback = null) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    console.error('Storage read error:', error);
    return fallback;
  }
}

// Convert data to JSON and save
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage write error:', error);
  }
}

// Delete one key
function removeFromStorage(key) {
  localStorage.removeItem(key);
}