/* -----------------------
   main.js - unified file
   ----------------------- */

/* -----------------------
   Demo product data
   ----------------------- */
const demoProducts = [
  { id: 1, title: "Modern Minimalist Chair", price: 25199, image: "assets/images/product1.jpg", category: "seating" },
  { id: 2, title: "Contemporary Table Lamp", price: 11199, image: "assets/images/product2.jpg", category: "lighting" },
  { id: 3, title: "Luxury Modern Sofa", price: 125999, image: "assets/images/product3.jpg", category: "seating" },
  { id: 4, title: "Abstract Wall Art", price: 16799, image: "assets/images/product4.jpg", category: "decor" },
  { id: 5, title: "Modern Office Desk", price: 50399, image: "assets/images/product5.jpg", category: "tables" },
  { id: 6, title: "Modern Platform Bed", price: 109199, image: "assets/images/product6.jpg", category: "bedroom" },
  { id: 7, title: "Decorative Ceramic Vase", price: 4599, image: "assets/images/product7.jpg", category: "decor" },
  { id: 8, title: "Modern Coffee Table", price: 32899, image: "assets/images/product8.jpg", category: "tables" },
  { id: 9, title: "Wooden Cupboard", price: 72499, image: "assets/images/product9.jpg", category: "storage" },
  { id: 10, title: "Modern Bathroom Vanity", price: 88299, image: "assets/images/product10.jpg", category: "bathroom" },
  { id: 11, title: "Ergonomic Gaming Chair", price: 45499, image: "assets/images/product11.jpg", category: "seating" },
  { id: 12, title: "Minimalist Floor Lamp", price: 19999, image: "assets/images/product12.jpg", category: "lighting" }
];

/* -----------------------
   Local storage cart helpers
   ----------------------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function findProductById(id) {
  return demoProducts.find(p => p.id === id) || null;
}

/* Add item to cart (id number) */
function addToCart(id, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) cart[idx].qty = Math.max(1, cart[idx].qty + qty);
  else {
    const p = findProductById(id);
    cart.push({
      id: id,
      qty: Math.max(1, qty),
      title: p ? p.title : 'Product',
      price: p ? p.price : 0,
      image: p ? p.image : '',
      category: p ? p.category : ''
    });
  }
  saveCart(cart);
  updateCartCount();
  // re-render if page provides function
  if (typeof renderCartPage === 'function') renderCartPage();
}

/* Remove item */
function removeFromCart(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartCount();
  if (typeof renderCartPage === 'function') renderCartPage();
}

/* Set quantity for an item */
function updateQty(id, qty) {
  const cart = getCart();
  const it = cart.find(i => i.id === id);
  if (!it) return;
  it.qty = Math.max(1, Math.floor(qty) || 1);
  saveCart(cart);
  updateCartCount();
  if (typeof renderCartPage === 'function') renderCartPage();
}

/* Cart totals */
function cartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((s,i) => s + (i.price * i.qty), 0);
  const shipping = cart.length ? 25 : 0;
  const tax = +(subtotal * 0.08).toFixed(0);
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

/* Update header cart count element */
function updateCartCount() {
  const total = getCart().reduce((s,i) => s + i.qty, 0);
  const el = document.querySelector('.cart-count');
  if (el) el.textContent = total;
}

/* -----------------------
   DOM ready initial setup
   ----------------------- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // wire up [data-add] add-to-cart buttons
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.add);
      addToCart(id, 1);
    });
  });

  // category filter on shop page (checkboxes inside aside)
  const categoryCheckboxes = document.querySelectorAll('aside input[type="checkbox"]');
  if (categoryCheckboxes.length) {
    categoryCheckboxes.forEach(cb => cb.addEventListener('change', applyShopFilter));
    // initial apply
    applyShopFilter();
  }

  // product tabs
  document.querySelectorAll('[data-tab-button]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tabButton;
      document.querySelectorAll('[data-tab-panel]').forEach(p => p.hidden = p.dataset.tabPanel !== target);
      document.querySelectorAll('[data-tab-button]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // faq accordion
  document.querySelectorAll('.faq-item .faq-title').forEach(title => {
    title.addEventListener('click', () => {
      const body = title.nextElementSibling;
      if (!body) return;
      body.hidden = !body.hidden;
    });
  });

  // forms validation
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach(inp => {
        if (!inp.value.trim()) { ok = false; inp.style.outline = '2px solid rgba(255,0,0,0.2)'; }
        else inp.style.outline = 'none';
      });
      if (!ok) { alert('Please fill required fields.'); return; }
      alert('Form submitted (demo).');
    });
  });
});

/* -----------------------------------------
   Delegated click/change handlers (global)
   - Handles qty +/- and trash (data-remove)
   - Handles manual change of qty input
   ----------------------------------------- */

document.addEventListener('click', (e) => {
  const t = e.target;

  // decrease
  if (t.matches('.qty-decrease') || t.closest('.qty-decrease')) {
    const btn = t.closest('.qty-decrease') || t;
    const container = btn.closest('.qty');
    if (!container) return;
    const input = container.querySelector('input[data-id]');
    if (!input) return;
    const id = Number(input.dataset.id);
    const val = Math.max(1, Number(input.value) - 1);
    input.value = val;
    updateQty(id, val);
  }

  // increase
  if (t.matches('.qty-increase') || t.closest('.qty-increase')) {
    const btn = t.closest('.qty-increase') || t;
    const container = btn.closest('.qty');
    if (!container) return;
    const input = container.querySelector('input[data-id]');
    if (!input) return;
    const id = Number(input.dataset.id);
    const val = Math.max(1, Number(input.value) + 1);
    input.value = val;
    updateQty(id, val);
  }

  // remove (trash)
  if (t.matches('[data-remove]') || t.closest('[data-remove]')) {
    const el = t.matches('[data-remove]') ? t : t.closest('[data-remove]');
    const id = Number(el.dataset.remove);
    if (Number.isFinite(id)) {
      if (confirm('Remove this item from your cart?')) removeFromCart(id);
    }
  }
});

// handle direct typing in quantity input
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.matches('.qty input') || t.matches('input[data-id]')) {
    const id = Number(t.dataset.id);
    const val = Math.max(1, Math.floor(Number(t.value) || 1));
    t.value = val;
    updateQty(id, val);
  }
});

/* -----------------------
   Shop filter helper
   ----------------------- */
function applyShopFilter() {
  const checkboxes = document.querySelectorAll('aside input[type="checkbox"]');
  const selected = Array.from(checkboxes).filter(c => c.checked).map(c => c.parentElement.textContent.trim().toLowerCase());
  const products = document.querySelectorAll('.product');
  products.forEach(p => {
    const catEl = p.querySelector('.kicker') || p.querySelector('.category');
    const cat = catEl ? catEl.textContent.trim().toLowerCase() : '';
    p.style.display = (selected.length === 0 || selected.includes(cat)) ? 'block' : 'none';
  });
}

/* -----------------------
   FurniFit 2D planner (drag fixed)
   ----------------------- */

let room = document.getElementById('room');
let selectedFurni = null;
let furniCount = 0;

function addItem(type) {
  if (!room) return;
  const item = document.createElement('div');
  item.className = 'furni-item';
  item.dataset.type = type;
  Object.assign(item.style, {
    width: '80px',
    height: '80px',
    background: '#fff',
    border: '2px solid #000',
    borderRadius: '8px',
    position: 'absolute',
    left: '20px',
    top: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'move',
    userSelect: 'none',
    fontWeight: '700'
  });
  item.textContent = type.toUpperCase();

  item.addEventListener('mousedown', (ev) => {
    ev.stopPropagation();
    if (selectedFurni) selectedFurni.style.borderColor = '#000';
    selectedFurni = item;
    item.style.borderColor = 'red';
  });

  item.addEventListener('mousedown', (ev) => {
    ev.preventDefault();
    if (!room) return;
    const roomRect = room.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const shiftX = ev.clientX - itemRect.left;
    const shiftY = ev.clientY - itemRect.top;

    function onMove(e) {
      item.style.left = `${e.clientX - roomRect.left - shiftX}px`;
      item.style.top  = `${e.clientY - roomRect.top - shiftY}px`;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', onMove);
    }, { once: true });
  });

  room.appendChild(item);
  furniCount++;
  const counter = document.getElementById('itemCount');
  if (counter) counter.textContent = furniCount;
}

function rotateSelected() {
  if (!selectedFurni) return;
  let r = Number(selectedFurni.dataset.rot || 0) + 90;
  selectedFurni.dataset.rot = r;
  selectedFurni.style.transform = `rotate(${r}deg)`;
}

function removeSelected() {
  if (!selectedFurni) return;
  selectedFurni.remove();
  selectedFurni = null;
  furniCount--;
  const counter = document.getElementById('itemCount');
  if (counter) counter.textContent = furniCount;
}

function clearAll() {
  if (!room) return;
  room.innerHTML = '';
  furniCount = 0;
  selectedFurni = null;
  const counter = document.getElementById('itemCount');
  if (counter) counter.textContent = 0;
}

if (room) {
  room.addEventListener('mousedown', (e) => {
    if (e.target === room && selectedFurni) {
      selectedFurni.style.borderColor = '#000';
      selectedFurni = null;
    }
  });
}

/* -----------------------
   Expose some helpers to global if needed
   ----------------------- */
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQty = updateQty;
window.cartTotals = cartTotals;
window.addItem = addItem;
window.rotateSelected = rotateSelected;
window.removeSelected = removeSelected;
window.clearAll = clearAll;






