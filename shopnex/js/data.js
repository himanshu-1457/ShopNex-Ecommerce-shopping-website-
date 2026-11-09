/* data.js - product catalogue and category list (prices in INR) */

const CATEGORIES = [
  { name: 'Electronics', emoji: '🎧', description: 'Gadgets & smart devices' },
  { name: 'Fashion', emoji: '👕', description: 'Trendy everyday wear' },
  { name: 'Shoes', emoji: '👟', description: 'Sneakers, boots & more' },
  { name: 'Accessories', emoji: '🕶️', description: 'Complete your look' }
];

const PRODUCTS = [
  // ---------- Electronics ----------
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', category: 'Electronics', price: 7999, oldPrice: 11999, rating: 4.6, reviews: 1240, emoji: '🎧', featured: true, trending: true,
    description: 'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.' },
  { id: 2, name: 'Smart Fitness Watch', category: 'Electronics', price: 4999, oldPrice: 7499, rating: 4.4, reviews: 860, emoji: '⌚', featured: true, trending: false,
    description: 'AMOLED display smartwatch with heart-rate tracking, sleep monitor and 7-day battery.' },
  { id: 3, name: 'Portable Bluetooth Speaker', category: 'Electronics', price: 2999, oldPrice: 3999, rating: 4.3, reviews: 540, emoji: '🔊', featured: false, trending: true,
    description: 'Water-resistant speaker with deep bass and 12 hours of non-stop playtime.' },
  { id: 4, name: 'RGB Gaming Mouse', category: 'Electronics', price: 1499, oldPrice: 2199, rating: 4.5, reviews: 720, emoji: '🖱️', featured: false, trending: false,
    description: 'High-precision 12000 DPI gaming mouse with programmable buttons and RGB lighting.' },

  // ---------- Fashion ----------
  { id: 5, name: 'Oversized Purple Hoodie', category: 'Fashion', price: 1999, oldPrice: 2999, rating: 4.7, reviews: 980, emoji: '🧥', featured: true, trending: true,
    description: 'Soft fleece oversized hoodie with a premium fit, perfect for everyday comfort.' },
  { id: 6, name: 'Graphic Printed T-Shirt', category: 'Fashion', price: 799, oldPrice: 1199, rating: 4.2, reviews: 430, emoji: '👕', featured: false, trending: false,
    description: '100% cotton regular-fit t-shirt with a bold modern graphic print.' },
  { id: 7, name: 'Slim Fit Denim Jeans', category: 'Fashion', price: 1599, oldPrice: 2499, rating: 4.4, reviews: 610, emoji: '👖', featured: false, trending: true,
    description: 'Stretchable slim-fit jeans with a clean finish and all-day comfort.' },
  { id: 8, name: 'Floral Summer Dress', category: 'Fashion', price: 1799, oldPrice: 2599, rating: 4.5, reviews: 390, emoji: '👗', featured: true, trending: false,
    description: 'Lightweight breathable dress with an elegant floral pattern for summer days.' },

  // ---------- Shoes ----------
  { id: 9, name: 'Pro Running Shoes', category: 'Shoes', price: 3499, oldPrice: 4999, rating: 4.6, reviews: 1120, emoji: '👟', featured: true, trending: true,
    description: 'Cushioned lightweight running shoes with breathable mesh and strong grip sole.' },
  { id: 10, name: 'Classic White Sneakers', category: 'Shoes', price: 2799, oldPrice: 3799, rating: 4.5, reviews: 950, emoji: '👟', featured: false, trending: false,
    description: 'Minimal everyday sneakers that match every outfit, with a durable rubber sole.' },
  { id: 11, name: 'Leather Chelsea Boots', category: 'Shoes', price: 4999, oldPrice: 6999, rating: 4.3, reviews: 280, emoji: '🥾', featured: false, trending: true,
    description: 'Premium genuine-leather boots with elastic side panels and a sturdy heel.' },
  { id: 12, name: 'Sports Comfort Sandals', category: 'Shoes', price: 1299, oldPrice: 1899, rating: 4.1, reviews: 340, emoji: '🩴', featured: false, trending: false,
    description: 'Soft-footbed adjustable sandals designed for daily wear and travel.' },

  // ---------- Accessories ----------
  { id: 13, name: 'Urban Laptop Backpack', category: 'Accessories', price: 2499, oldPrice: 3499, rating: 4.6, reviews: 770, emoji: '🎒', featured: true, trending: true,
    description: 'Water-resistant backpack with a padded laptop compartment and USB charging port.' },
  { id: 14, name: 'Polarized Sunglasses', category: 'Accessories', price: 1299, oldPrice: 1999, rating: 4.4, reviews: 520, emoji: '🕶️', featured: false, trending: false,
    description: 'UV400 polarized sunglasses with a lightweight frame and stylish look.' },
  { id: 15, name: 'Classic Baseball Cap', category: 'Accessories', price: 599, oldPrice: 999, rating: 4.2, reviews: 310, emoji: '🧢', featured: false, trending: true,
    description: 'Adjustable cotton cap with embroidered logo, suitable for all seasons.' },
  { id: 16, name: 'Silver Chain Necklace', category: 'Accessories', price: 1499, oldPrice: 2299, rating: 4.5, reviews: 260, emoji: '📿', featured: true, trending: false,
    description: 'Stainless-steel silver chain with a modern finish that does not fade or tarnish.' }
];

/* ---------- Reusable product helpers ---------- */

// Find one product by its id (returns undefined if not found)
function getProductById(productId) {
  return PRODUCTS.find(product => product.id === Number(productId));
}

// Get all products of one category
function getProductsByCategory(categoryName) {
  return PRODUCTS.filter(product => product.category === categoryName);
}