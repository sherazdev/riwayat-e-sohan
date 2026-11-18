const C = window.STORE_CONFIG; const supplierBrands = [{ name: 'Al-Khair', id: 'al-khair' }, { name: 'Rewari', id: 'rewari' }, { name: 'Hafiz', id: 'hafiz' }]; const brandUrl = id => 'brand.html?brand=' + encodeURIComponent(id); const brandName = id => supplierBrands.find(b => b.id === id)?.name || ''; let products = []; const hiddenCats = ['Patisa', 'Nimko', 'Naan Khatai']; const cats = ['Halwajaat', 'Mix Halwa', 'Sohan Halwa', 'Barfi', 'Sweets']; const icons = { 'Halwajaat': '', 'Mix Halwa': '🎁', 'Sohan Halwa': '🍬', 'Barfi': '🥛', 'Sweets': '🍭', 'Patisa': '🍯', 'Nimko': '🥨', 'Naan Khatai': '🍪' }; const fmt = n => 'Rs. ' + Number(n).toLocaleString('en-PK'); const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); const categoryUrl = c => 'category-' + slug(c) + '.html'; const q = s => document.querySelector(s); const safe = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); const getCart = () => { try { return JSON.parse(localStorage.getItem('rs_cart') || '[]') } catch { return [] } }; const saveCart = x => { localStorage.setItem('rs_cart', JSON.stringify(x)); updateCount() }; function updateCount() { const e = q('#cart-count'); if (e) e.textContent = getCart().reduce((a, x) => a + x.qty, 0) } function add(id) { const p = products.find(x => x.id === id); if (!p || p.box || p.badge === 'Sold Out') return; let c = getCart(), r = c.find(x => x.id === id); if (r) r.qty++; else c.push({ id, qty: 1 }); saveCart(c); showCartPopup(p.name, 1) }
// Branded add-to-cart modal. No browser alert is used for adding products.
function ensureCartPopupStyles() {
  if (document.getElementById('rs-cart-popup-css')) return;
  const style = document.createElement('style');
  style.id = 'rs-cart-popup-css';
  style.textContent = `
    .rs-modal-overlay{position:fixed;inset:0;background:rgba(24,10,15,.62);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px;animation:rsFade .18s ease}
    .rs-modal{position:relative;background:#fff9ef;color:#35231f;border:1px solid #e6c88d;border-radius:19px;max-width:440px;width:100%;box-shadow:0 22px 70px rgba(20,0,0,.28);padding:28px;font-family:inherit;animation:rsPop .22s ease}
    .rs-modal-close{position:absolute;right:15px;top:12px;border:0;background:transparent;color:#6a2534;font-size:27px;cursor:pointer;line-height:1;padding:5px}
    .rs-modal-mark{display:inline-grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#f0e1bf;color:#651b2c;font-size:25px;font-weight:700;margin-bottom:10px}
    .rs-modal h2{font-size:25px;line-height:1.2;margin:0 0 4px;color:#651b2c}
    .rs-modal .rs-sub{color:#8d6e4c;font-size:13px;margin:0 0 19px}
    .rs-modal-product{border-top:1px solid #ead8ba;border-bottom:1px solid #ead8ba;padding:16px 0;margin:0 0 16px}
    .rs-modal-product strong{display:block;font-size:17px;color:#38251f}
    .rs-modal-product span{display:block;color:#75655d;font-size:14px;margin-top:4px}
    .rs-progress-panel{background:#f5e9d6;border-radius:10px;padding:14px;margin-bottom:19px}
    .rs-progress-label{display:flex;justify-content:space-between;gap:10px;color:#654c40;font-size:14px;margin-bottom:9px}
    .rs-progress-track{height:9px;background:#ddc6ac;border-radius:20px;overflow:hidden}
    .rs-progress-fill{height:100%;background:#651b2c;border-radius:20px;transition:width .2s}
    .rs-progress-help{font-size:13px;color:#765d50;margin:9px 0 0}
    .rs-modal-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .rs-modal-actions button,.rs-modal-actions a{display:flex;align-items:center;justify-content:center;text-align:center;min-height:44px;padding:10px 8px;border-radius:9px;font:600 13px inherit;text-decoration:none;cursor:pointer}
    .rs-continue{border:1px solid #651b2c;background:transparent;color:#651b2c}
    .rs-view{border:1px solid #651b2c;background:#651b2c;color:white!important}
    @keyframes rsFade{from{opacity:0}to{opacity:1}}@keyframes rsPop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
    @media(max-width:380px){.rs-modal{padding:22px 16px}.rs-modal-actions{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}
function closeCartPopup() {
  const modal = document.getElementById('rs-cart-popup');
  if (modal) modal.remove();
  document.removeEventListener('keydown', rsCartPopupKeydown);
}
function rsCartPopupKeydown(event) { if (event.key === 'Escape') closeCartPopup(); }
function showCartPopup(productName, addedKg) {
  ensureCartPopupStyles();
  closeCartPopup();
  const weight = getCart().reduce((sum, item) => sum + item.qty, 0);
  const remaining = Math.max(0, 1 - weight);
  const overlay = document.createElement('div');
  overlay.id = 'rs-cart-popup';
  overlay.className = 'rs-modal-overlay';
  overlay.innerHTML = `<div class="rs-modal" role="dialog" aria-modal="true" aria-labelledby="rs-modal-title">
    <button type="button" class="rs-modal-close" aria-label="Close popup">&times;</button>
    <div class="rs-modal-mark" aria-hidden="true">✓</div>
    <h2 id="rs-modal-title">Added to Your Cart!</h2>
    <p class="rs-sub">Riwayat-e-Sohan</p>
    <div class="rs-modal-product"><strong>${safe(productName)}</strong><span>${addedKg} KG added successfully</span></div>
    <div class="rs-progress-panel"><div class="rs-progress-label"><span>Cart weight</span><strong>${weight} / 1 KG${weight > 1 ? ' minimum' : ''}</strong></div>
      <div class="rs-progress-track"><div class="rs-progress-fill" style="width:${Math.min(100, weight / 1 * 100)}%"></div></div>
      <p class="rs-progress-help">${remaining ? `Add ${remaining} KG more to unlock checkout.` : 'Minimum order reached! You can proceed to checkout.'}</p>
    </div>
    <div class="rs-modal-actions"><button type="button" class="rs-continue">Continue Shopping</button><a class="rs-view" href="cart.html">View Cart</a></div>
  </div>`;
  overlay.addEventListener('click', event => { if (event.target === overlay) closeCartPopup(); });
  overlay.querySelector('.rs-modal-close').addEventListener('click', closeCartPopup);
  overlay.querySelector('.rs-continue').addEventListener('click', closeCartPopup);
  document.body.appendChild(overlay);
  document.addEventListener('keydown', rsCartPopupKeydown);
  overlay.querySelector('.rs-modal-close').focus();
}

function inquiry(id) { const p = products.find(x => x.id === id); if (!p) return; window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent('Assalam o Alaikum! Please confirm the net weight and final price for ' + p.name + '. I understand the minimum order is 1 KG and TCS charges are included.'), '_blank', 'noopener') } // Product photos: set product.image in products.json, or place a PNG in assests/images/ named after the product slug.
function productImageUrl(p) {
  return p.image || './assests/images/' + slug(p.name) + '.png';
}
function productImageMarkup(p, large = false) {
  const fallback = `<span class="food"${large ? ' style="font-size:140px"' : ''}>${icons[p.category] || '🍬'}</span><span class="placeholder">PRODUCT IMAGE COMING SOON</span>`;
  return `<img class="rs-product-photo" src="${safe(productImageUrl(p))}" alt="${safe(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='';"><span class="rs-photo-fallback" style="display:none">${fallback}</span>`;
}
function ensureProductPhotoStyles() {
  if (document.getElementById('rs-product-photo-css')) return;
  const el = document.createElement('style'); el.id = 'rs-product-photo-css';
  el.textContent = `.pic{position:relative;overflow:hidden}.rs-product-photo{display:block;width:100%;height:100%;object-fit:cover;object-position:center}.rs-photo-fallback{width:100%;height:100%}`;
  document.head.appendChild(el);
}
function productCard(p) { return `<article class="product"><a href="product.html?id=${encodeURIComponent(p.id)}"><div class="pic">${p.badge ? `<span class="badge">${safe(p.badge)}</span>` : ''}${productImageMarkup(p)}</div></a><div class="info"><a href="product.html?id=${encodeURIComponent(p.id)}"><h3>${safe(p.name)}</h3></a><p>${safe(p.category)}</p><div class="price">${p.box ? 'Add to car' : fmt(p.price) + ' / KG'}</div><button class="btn dark" ${p.badge === 'Sold Out' ? 'disabled' : ''} onclick="${p.box ? `inquiry('${p.id}')` : `add('${p.id}')`}">${p.badge === 'Sold Out' ? 'Sold Out' : p.box ? 'Ask Box Price' : 'Add to Cart'}</button></div></article>` } function paymentLogo(provider) { const logos = { JazzCash: './assests/images/jazzcash-logo.png', Easypaisa: './assests/images/easypaisa-logo.png' }; return `<img class="rs-payment-logo" src="${logos[provider]}" alt="${provider} logo" loading="lazy" onerror="this.style.display='none'">` } function ensurePaymentStyles() { if (document.getElementById('rs-payment-styles')) return; const style = document.createElement('style'); style.id = 'rs-payment-styles'; style.textContent = '.payments{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.rs-payment-pill{display:inline-flex;align-items:center;gap:8px;padding:7px 11px;border:1px solid #e1cba4;border-radius:9px;background:#fffaf0;color:#43252b;font-weight:600}.rs-payment-logo{width:68px;height:30px;object-fit:contain}.rs-payment-method{display:flex;flex-direction:column;align-items:center;gap:8px}'; document.head.appendChild(style) } 


function ensureWinterTickerStyles() {
  if (document.getElementById('rs-winter-ticker-css')) return;

  const style = document.createElement('style');
  style.id = 'rs-winter-ticker-css';

  style.textContent = `
    .rs-winter-ticker {
      display: flex;
      align-items: center;
      overflow: hidden;
      background: #4c1026;
      color: #f4d69b;
      border-bottom: 1px solid #a87c46;
      min-height: 38px;
    }

    .rs-winter-label {
      flex: none;
      z-index: 1;
      background: #d5ad65;
      color: #3d1020;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .5px;
      padding: 12px 14px;
      white-space: nowrap;
    }

    .rs-winter-viewport {
      overflow: hidden;
      flex: 1;
      min-width: 0;
    }

    .rs-winter-track {
      display: flex;
      width: max-content;
      animation: rsWinterScroll 55s linear infinite;
      animation-direction: reverse;
      will-change: transform;
    }

    .rs-winter-copy {
      flex: none;
      white-space: nowrap;
      padding: 0 28px;
      font-size: 17px;
      font-weight: 600;
      letter-spacing: 0;
      direction: rtl;
      font-family: 'Noto Naskh Arabic',
                   'Noto Nastaliq Urdu',
                   Tahoma, serif;
      line-height: 1.8;
    }

    .rs-winter-ticker:hover .rs-winter-track,
    .rs-winter-ticker:focus-within .rs-winter-track {
      animation-play-state: paused;
    }

    @keyframes rsWinterScroll {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    @media (max-width: 600px) {
      .rs-winter-label {
        font-size: 10px;
        padding: 12px 8px;
      }

      .rs-winter-copy {
        font-size: 15px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .rs-winter-track {
        animation: none;
      }

      .rs-winter-viewport {
        overflow-x: auto;
      }
    }
  `;

  document.head.appendChild(style);
}

function winterTicker() {
  const message = '❄️ سردیوں کی سوغات، روایتِ سوہن کے ساتھ!  ✦  🍯 ملتانی سوہن حلوے کی روایتی مٹھاس سے لطف اٹھائیں  ✦  🎁 اس موسمِ سرما میں اپنوں کے ساتھ مٹھاس اور محبت بانٹیں  ✦  🚚 کم از کم آرڈر ۱ کلو، ٹی سی ایس ڈیلیوری شامل  ✦    ✦  ';
  return `<div class="rs-winter-ticker" aria-label="موسمِ سرما کی خصوصی اطلاع"><div class="rs-winter-viewport"><div class="rs-winter-track"><span class="rs-winter-copy" lang="ur" dir="rtl">${message}</span><span class="rs-winter-copy" lang="ur" dir="rtl" aria-hidden="true">${message}</span></div></div></div>`;
}
function layout(content) { ensurePaymentStyles(); ensureProductPhotoStyles(); ensureWinterTickerStyles(); q('#app').innerHTML = `<div class="top"></div>
  
  ${winterTicker()}<header class="header"><div class="headin"><a class="brand" href="index.html">Riwayat-e-Sohan<small>روایتِ سوہن · MULTANI SWEETS</small></a><nav class="nav"><a href="index.html">Home</a><a href="shop.html">Shop All</a><a href="category-sohan-halwa.html">Sohan Halwa</a><a href="category-mix-halwa.html">Mix Halwa</a><a href="category-barfi.html">Barfi</a><a href="about.html">Our Story</a><a href="contact.html">Contact</a></nav><a class="btn" href="cart.html">Cart (<span id="cart-count">0</span>)</a></div></header>${content}<footer class="foot"><div class="wrap"><div class="foot-grid"><div><div class="brand">Riwayat-e-Sohan</div><h3>Multan Ki Riwaayat, Har Niwalay Mein Mithaas</h3><p>Curated sweets, packed under the Riwayat-e-Sohan label. Minimum 1 KG. TCS delivery is included in the displayed prices.</p><p>WhatsApp Orders: <a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">+92 300 4238576</a></p></div><div><h3>Explore</h3>${cats.map(c => `<a href="${categoryUrl(c)}">${c}</a>`).join('')}</div><div><h3>Payment Options</h3><div class="payments"><span class="rs-payment-pill">${paymentLogo('JazzCash')}JazzCash</span><span class="rs-payment-pill">${paymentLogo('Easypaisa')}Easypaisa</span></div><p>Advance Payment Only<br>No Cash on Delivery</p><a href="contact.html">Contact & Order Help</a><a href="policies.html">Delivery & Policies</a></div></div><div class="copyright">© ${new Date().getFullYear()} Riwayat-e-Sohan · Product images and final prices to be confirmed before launch.</div></div></footer>`; updateCount() } function categoryCards() {
  const featured = [
    { title: 'Halwa', desc: 'Explore traditional Multani Sohan Halwa and more', image: './assests/images/category-halwa.jpg', href: 'shop.html?collection=halwa' },
    { title: 'Barfi', desc: 'Discover creamy, nutty barfi favourites', image: './assests/images/category-barfi.jpg', href: 'category-barfi.html' },
    { title: 'Sweets', desc: 'Treat yourself to Gulab Jamun and classic mithai', image: './assests/images/category-sweets.jpg', href: 'category-sweets.html' }
  ];
  return featured.map(c => `<a class="rs-delight-card" href="${c.href}"><img src="${c.image}" alt="${c.title} sweets" loading="lazy"><span class="rs-delight-info"><strong>${c.title}</strong><small>${c.desc}</small><span class="rs-delight-cta">Explore Collection →</span></span></a>`).join('');
}
function ensureDelightStyles() {
  if (document.getElementById('rs-delight-css')) return;
  const el = document.createElement('style'); el.id = 'rs-delight-css';
  el.textContent = `.rs-delight-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:28px}.rs-delight-card{display:block;overflow:hidden;border-radius:16px;border:1px solid #d8b778;background:#fff9ef;text-decoration:none;color:#512033;box-shadow:0 9px 24px rgba(74,16,35,.12);transition:transform .2s,box-shadow .2s}.rs-delight-card:hover{transform:translateY(-5px);box-shadow:0 15px 34px rgba(74,16,35,.19)}.rs-delight-card img{display:block;width:100%;height:245px;object-fit:cover}.rs-delight-info{display:flex;flex-direction:column;gap:9px;padding:20px}.rs-delight-info strong{font-family:Georgia,serif;font-size:27px;color:#641c32}.rs-delight-info small{font-size:14px;line-height:1.5;color:#735e54;min-height:42px}.rs-delight-cta{font-size:13px;font-weight:700;color:#9a682c;text-transform:uppercase;letter-spacing:.5px}@media(max-width:750px){.rs-delight-grid{grid-template-columns:1fr;max-width:500px;margin-left:auto;margin-right:auto}.rs-delight-card img{height:230px}}`;
  document.head.appendChild(el);
} function home() { ensureDelightStyles(); layout(`<section class="hero"><div class="wrap hero-grid"><div><div class="eyebrow">Premium Multani Sweets</div><h1>Multan Ki Riwaayat,<br>Har Niwalay Mein Mithaas.</h1><p>Explore traditional Sohan Halwa, handcrafted-style sweets and curated gift assortments. Choose your favourites, add at least 1 KG, and send your order on WhatsApp.</p><a href="shop.html" class="btn">Shop the Collection</a> <a href="https://wa.me/${C.whatsapp}" class="btn alt" target="_blank" rel="noopener">WhatsApp Us</a></div><div class="hero-art"><div class="emblem">✦</div><strong>روایتِ سوہن</strong><span>Riwayat-e-Sohan</span><span>ROYAL MAROON · GOLD</span></div></div></section><section class="section"><div class="wrap"><h2>Choose Your Delight</h2><p class="sub">Browse separate collections</p><div class="rs-delight-grid">${categoryCards()}</div></div></section><section class="section" style="background:#f7eee1"><div class="wrap"><h2>Most Ordered Right Now</h2><p class="sub">Popular sweets from our planned catalogue</p><div class="products">${products.filter(p => ['Akhroti Sohan Halwa', 'Dry Fruit Sohan Halwa', 'Shahi Sohan Halwa', 'Pista Halwa', 'Badam Paak', 'Simple Sohan Halwa', '2Kg Mix Halwa Box 6 in 1', '4 In 1 Mix Halwa Box'].includes(p.name)).map(productCard).join('')}</div></div></section><section class="section"><div class="wrap"><h2>How Ordering Works</h2><div class="catgrid"><div class="cat">🛍️<b>Choose Sweets</b><p class="small">Select 1 KG or more</p></div><div class="cat">📋<b>Enter Details</b><p class="small">Name, phone and full address</p></div><div class="cat">💬<b>Order Confirmation</b><p class="small">We confirm shipping & total</p></div><div class="cat">🚚<b>Prepay & Dispatch</b><p class="small">Verified payment, then TCS</p></div></div></div></section>`) } function catalog(cat) { const halwaCollection = !cat && new URLSearchParams(location.search).get('collection') === 'halwa'; let arr = halwaCollection ? products.filter(p => /halwa|halwajaat/i.test(p.category) || /halwa/i.test(p.name)) : cat ? products.filter(p => p.category === cat) : products; let heading = halwaCollection ? 'Halwa Collection' : cat || 'All Products'; layout(`<main class="wrap"><div class="crumb"><a href="index.html">Home</a> / ${safe(heading)}</div><h1 class="page-title">${safe(heading)}</h1><p class="sub">Filter Your Favorites · ${arr.length} listed products</p><div class="collection"><aside class="sidebar"><strong>Collections</strong>${cats.map(c => `<a class="${c === cat ? 'active' : ''}" href="${categoryUrl(c)}">${c}</a>`).join('')}</aside><section><div class="toolbar"><input id="search" placeholder="Search products..." aria-label="Search products"><select id="sort"><option value="default">Featured</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name">Name A to Z</option></select></div><div id="listing" class="products"></div></section></div></main><div style="height:60px"></div>`); const render = () => { let s = q('#search').value.toLowerCase(), sort = q('#sort').value; let a = arr.filter(p => p.name.toLowerCase().includes(s)); if (sort === 'name') a.sort((x, y) => x.name.localeCompare(y.name)); if (sort.startsWith('price')) a.sort((x, y) => sort === 'price-asc' ? (x.price ?? Infinity) - (y.price ?? Infinity) : (y.price ?? -1) - (x.price ?? -1)); q('#listing').innerHTML = a.length ? a.map(productCard).join('') : '<div class="empty">No matching products yet.</div>' }; q('#search').oninput = render; q('#sort').onchange = render; render() } function product() { let id = new URLSearchParams(location.search).get('id'), p = products.find(x => x.id === id); if (!p) { catalog(); return } layout(`<main class="wrap"><div class="crumb"><a href="index.html">Home</a> / <a href="${categoryUrl(p.category)}">${p.category}</a> / ${safe(p.name)}</div><div class="hero-grid" style="padding:35px 0 75px"><div class="pic" style="height:420px;border-radius:12px">${productImageMarkup(p, true)}</div><div><div class="eyebrow">${p.category}</div><h1 class="page-title">${safe(p.name)}</h1><div class="price" style="font-size:27px">${p.box ? 'Final price to confirm' : fmt(p.price) + ' / KG'}</div><p class="sub">${p.box ? 'Reference box listing: ' + fmt(p.base) + '. Box weight and per-KG markup must be verified.' : 'Provisional reference-based price; supplier weight not yet verified.'}</p><div class="notice">Minimum combined cart weight: 1 KG. Advance payment only; TCS charges included.</div><p><button class="btn dark" ${p.badge === 'Sold Out' ? 'disabled' : ''} onclick="${p.box ? `inquiry('${p.id}')` : `add('${p.id}')`}">${p.badge === 'Sold Out' ? 'Sold Out' : p.box ? 'Ask About This Box' : 'Add to Cart'}</button> <a class="btn" href="cart.html">View Cart</a></p><h3>Product Information</h3><p>Ingredients, allergens, shelf life, weight variants and final packaging details will be added once verified with the supplier.</p></div></div></main>`) } function cart() { layout(`<main class="wrap"><div class="crumb"><a href="index.html">Home</a> / Your Cart</div><h1 class="page-title">Your Cart & Checkout</h1><div class="panel"><div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><h2>Your Selected Products</h2><button type="button" class="copy" onclick="clearCart()">Clear Entire Cart</button></div><div id="cart-items"></div></div><div class="panel"><h2>Delivery Details</h2><div class="form"><div><label for="name">Full Name *</label><input id="name" autocomplete="name" required></div><div><label for="phone">Phone Number *</label><input id="phone" inputmode="tel" required></div><div class="full"><label for="address">Complete Address with House Number & Street *</label><textarea id="address" rows="3" required></textarea></div><div><label for="city">City *</label><input id="city" required></div><div><label for="postal">Postal Code (optional)</label><input id="postal"></div><div class="full"><label for="notes">Order Notes (optional)</label><textarea id="notes" rows="2"></textarea></div></div><p class="notice">TCS delivery included in listed prices. No additional TCS fee. Advance payment only; no Cash on Delivery.</p><button class="btn dark" id="order" onclick="checkout()">Place Order Securely</button><p id="error" style="color:#9c2534"></p></div><div class="panel"><h2>Advance Payment Methods</h2><p>Pay the order total only after your order is confirmed. TCS delivery is included.</p><div class="catgrid" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="cat rs-payment-method">${paymentLogo('JazzCash')}<strong>JazzCash</strong><p>${C.jazzcash}</p><p class="small">${C.accountHolder}</p><button class="copy" onclick="copyNumber('${C.jazzcash}')">Copy Number</button></div><div class="cat rs-payment-method">${paymentLogo('Easypaisa')}<strong>Easypaisa</strong><p>${C.easypaisa}</p><p class="small">${C.accountHolder}</p><button class="copy" onclick="copyNumber('${C.easypaisa}')">Copy Number</button></div></div><p class="small">Share transaction ID or screenshot on WhatsApp. Payment is manually verified before TCS dispatch.</p></div></main>`); renderCart() } function copyNumber(n) { navigator.clipboard?.writeText(n).then(() => alert('Number copied')).catch(() => prompt('Copy number:', n)) } function renderCart() { let c = getCart(), rows = c.map(x => ({ ...x, p: products.find(p => p.id === x.id) })).filter(x => x.p); let kg = rows.reduce((a, x) => a + x.qty, 0), total = rows.reduce((a, x) => a + x.qty * x.p.price, 0); q('#cart-items').innerHTML = rows.length ? rows.map(x => `<div class="cartline"><div><strong>${safe(x.p.name)}</strong><div class="small">${fmt(x.p.price)} / KG</div></div><input class="qty" type="number" min="1" max="100" value="${x.qty}" aria-label="Quantity KG" onchange="setQty('${x.id}',this.value)"><strong>${fmt(x.qty * x.p.price)}</strong><button class="copy" onclick="removeItem('${x.id}')">Remove</button></div>`).join('') + `<p class="summary">Total Weight: ${kg} KG · Product Subtotal: ${fmt(total)}</p><p class="small">TCS delivery included. Minimum 1 KG required.</p>` : '<div class="empty">Your cart is empty. <a href="shop.html">Browse sweets</a></div>'; if (q('#order')) q('#order').disabled = kg < 1; if (q('#error')) q('#error').textContent = kg < 1 ? 'Add at least ' + (1 - kg) + ' KG more to checkout.' : '' } function clearCart() { if (!getCart().length) return; if (!confirm('Remove all products from your cart?')) return; saveCart([]); renderCart(); } function setQty(id, v) { let n = Math.max(1, Math.min(100, Math.floor(Number(v) || 1))); let c = getCart(), r = c.find(x => x.id === id); if (r) r.qty = n; saveCart(c); renderCart() } function removeItem(id) { saveCart(getCart().filter(x => x.id !== id)); renderCart() } async function checkout() {
  const c = getCart(), kg = c.reduce((a, x) => a + x.qty, 0), error = q('#error'), button = q('#order');
  if (kg < 1) { error.textContent = 'Minimum order 1 KG.'; return }
  const fields = ['name', 'phone', 'address', 'city']; const missing = fields.find(k => !q('#' + k).value.trim());
  if (missing) { error.textContent = 'Please enter ' + missing + ' before proceeding.'; q('#' + missing).focus(); return }
  const customer = {}; for (const k of ['name', 'phone', 'address', 'city', 'postal', 'notes']) customer[k] = q('#' + k).value.trim();
  button.disabled = true; button.textContent = 'Submitting your order...'; error.textContent = '';
  try {
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, items: c }) });
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Order could not be submitted.');
    saveCart([]);
    const checkoutPanel = button.closest('.panel');
    checkoutPanel.innerHTML = `<div class="order-success" role="status" style="padding:24px;border:2px solid #c9a35c;border-radius:14px;background:#fff8e9;text-align:center"><div style="font-size:42px">✓</div><h2 style="color:#651b2c">Order Received!</h2><p>Thank you, ${safe(customer.name)}. Your order was saved successfully.</p><p><strong>Order ID: ${safe(data.orderId)}</strong></p><p>Product subtotal: ${fmt(data.productSubtotal)} · ${data.totalKg} KG</p><p>You will receive the confirmation call shortly. Please stay active Thanks :) </p><p>Payment status: Not paid.</p><a class="btn dark" href="shop.html">Continue Shopping</a></div>`;
    renderCart(); window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) { error.textContent = e.message + ' If the issue continues, contact us on WhatsApp.'; button.disabled = false; button.textContent = 'Place Order Securely' }
}
function infoPage(type) {
  let content = type === 'about' ? `
<style>
.rs-story{color:#392a27;font-size:15px;line-height:1.85}
.rs-story *{box-sizing:border-box}
.rs-story-hero{position:relative;overflow:hidden;border-radius:16px;padding:48px 24px;margin-bottom:36px;text-align:center;color:#fff5e6;border:1px solid #d8af67;background:radial-gradient(ellipse at 50% 0%,#8c3446 0%,transparent 58%),linear-gradient(125deg,#430c1f,#711a34 60%,#4b1125);box-shadow:0 12px 30px rgba(72,14,32,.15)}
.rs-story-hero:before,.rs-story-hero:after{content:'✦';position:absolute;color:#d8ac60;font-size:45px;opacity:.42;top:12px}
.rs-story-hero:before{left:20px}.rs-story-hero:after{right:20px}
.rs-story-hero .rs-eyebrow{color:#efd29e;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;font-size:12px;margin:0 0 10px}
.rs-story-hero h1{font-family:Georgia,serif;font-size:clamp(34px,6vw,53px);font-weight:600;line-height:1.12;color:#f5dc9e;margin:0 0 12px}
.rs-story-hero .rs-tagline{font-size:17px;font-weight:600;letter-spacing:.8px;color:#f6dcad;margin:0 0 18px}
.rs-story-hero .rs-hero-desc{max-width:590px;margin:0 auto;color:#fff7ef;font-size:16px;line-height:1.7}
.rs-story .rs-intro{font-size:17px;line-height:1.95}
.rs-story h2{font-family:Georgia,serif;font-size:clamp(24px,4vw,30px);line-height:1.3;color:#6b1931;margin:38px 0 15px}
.rs-story h3{color:#6b1931;font-size:17px;line-height:1.4;margin:0 0 7px}
.rs-story p{margin:0 0 17px}
.rs-story strong{color:#67223a}
.rs-story .rs-gold-line{height:2px;background:linear-gradient(90deg,transparent,#c59d56,transparent);margin:30px 0}
.rs-story .rs-feature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;margin:20px 0 24px}
.rs-story .rs-feature{border:1px solid #ebd7b5;border-radius:11px;background:#fffaf1;padding:16px 18px;box-shadow:0 2px 8px rgba(60,30,14,.035)}
.rs-story .rs-feature h3:before{content:'✦';color:#ba8b39;margin-right:8px}
.rs-story .rs-feature p{font-size:14px;line-height:1.6;margin:0}
.rs-story .rs-bullets{padding-left:23px;margin:14px 0 24px}
.rs-story .rs-bullets li{margin:9px 0;padding-left:3px}
.rs-story .rs-bullets li::marker{color:#b88e43}
.rs-story .rs-soft-panel{background:#fff9ed;border:1px solid #e9cf9e;border-left:5px solid #a47a34;border-radius:10px;padding:23px 24px;margin:25px 0}
.rs-story .rs-soft-panel h2{margin:0 0 12px;font-size:25px}
.rs-story .rs-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0}
.rs-story .rs-value{padding:13px 15px;background:#f8eee0;border-radius:9px}
.rs-story .rs-value p{margin:3px 0 0;font-size:14px;line-height:1.6}
.rs-story .rs-cta{text-align:center;background:linear-gradient(135deg,#4a0d24,#72233c);border:1px solid #d8b474;border-radius:13px;padding:34px 20px;color:#fff8ef;margin-top:36px}
.rs-story .rs-cta h2{color:#f2d39b;margin:0 0 10px}
.rs-story .rs-cta p{color:#fff5e5;margin:0 0 17px}
.rs-story .rs-cta a{display:inline-block;background:#e9c98c;color:#4b1023!important;padding:11px 22px;border-radius:8px;font-weight:700;text-decoration:none}
.rs-story .rs-note{font-size:13px;color:#725d55;line-height:1.7}
@media(max-width:650px){.rs-story-hero{padding:39px 19px}.rs-story .rs-feature-grid,.rs-story .rs-values{grid-template-columns:1fr}.rs-story .rs-feature{padding:15px}.rs-story .rs-soft-panel{padding:18px}}
</style>
<article class="rs-story">
  <header class="rs-story-hero">
    <p class="rs-eyebrow">Rooted in Multan's Sweet Heritage</p>
    <h1>Our Story</h1>
    <p class="rs-tagline">Riwayat-e-Sohan · Har Mithaas Mein Riwaayat</p>
    <p class="rs-hero-desc">A celebration of timeless Pakistani flavours, cherished traditions, and the joy of sharing something sweet.</p>
  </header>

  <h2>Where Tradition Meets Thoughtful Presentation</h2>
  <p class="rs-intro">Every sweet has a flavour, but some flavours hold a story. They remind us of family gatherings, festive occasions, warm hospitality, and the places we call home.</p>
  <p>Welcome to <strong>Riwayat-e-Sohan</strong>, a Pakistani sweets retail brand inspired by the rich cultural heritage and beloved traditional flavours of <strong>Multan</strong>. Our name reflects our purpose: to celebrate the sweetness of tradition and bring it into a convenient, beautiful online shopping experience.</p>
  <p>From the distinct appeal of Multani Sohan Halwa to a delightful variety of traditional sweets and gift assortments, we aim to make familiar favourites easier to explore, choose, and share with loved ones.</p>
  <p>At the heart of our brand is a simple belief: <strong>mithaas is more than dessert — it is a gesture of care, celebration, and connection.</strong></p>
  <p>We operate as a <strong>retailer, not a manufacturer</strong>. We source sweets from established suppliers and present their products through our Riwayat-e-Sohan store. This lets us focus on curating selections, organizing product information, and delivering a thoughtful customer experience, while respecting the origin of each product.</p>

  <div class="rs-gold-line"></div>
  <h2>What Makes Riwayat-e-Sohan Special?</h2>
  <p>Our approach brings traditional taste and modern shopping together through the following priorities:</p>
  <div class="rs-feature-grid">
    <div class="rs-feature"><h3>Inspired by Multan</h3><p>A brand identity shaped by the city's enduring heritage, hospitality, and celebrated sweet traditions.</p></div>
    <div class="rs-feature"><h3>Traditional Sweet Collections</h3><p>A curated selection of classic Pakistani mithaas Payment Options
across multiple product categories.</p></div>
    <div class="rs-feature"><h3>Sohan Halwa Favourites</h3><p>Discover distinctive Sohan Halwa varieties, from classic options to nut-rich selections.</p></div>
    <div class="rs-feature"><h3>Mix Halwa & Gift Assortments</h3><p>Explore combination packs and gifting choices for different tastes and occasions.</p></div>
    <div class="rs-feature"><h3>Honest Product Representation</h3><p>We distinguish our retail brand from the suppliers who make the sweets.</p></div>
    <div class="rs-feature"><h3>Elegant Brand Experience</h3><p>Royal maroon-and-gold styling expresses our appreciation for traditional Pakistani aesthetics.</p></div>
    <div class="rs-feature"><h3>Clear Shopping Information</h3><p>We aim to share confirmed weights, prices, availability, ingredients, and packaging details clearly.</p></div>
    <div class="rs-feature"><h3>Thoughtful Gifting</h3><p>Traditional sweets make meaningful choices for sharing with friends, family, and colleagues.</p></div>
    <div class="rs-feature"><h3>Convenient Online Ordering</h3><p>Explore categories, discover products, and submit orders through a straightforward store.</p></div>
    <div class="rs-feature"><h3>Respectful Customer Service</h3><p>We value prompt, polite communication and careful attention to customer questions.</p></div>
    <div class="rs-feature"><h3>Continuous Improvement</h3><p>We are developing our product catalogue, store experience, and service as our business grows.</p></div>
  </div>

  <h2>Explore the Sweetness of Tradition</h2>
  <p>Our evolving collection celebrates the diversity of Pakistani sweets, with categories including:</p>
  <ul class="rs-bullets">
    <li><strong>Sohan Halwa:</strong> Traditional, Akhroti, Shahi, Dry Fruit, and other listed varieties, subject to availability.</li>
    <li><strong>Mix Halwa:</strong> Assorted combinations and gift boxes for sharing or special occasions.</li>
    <li><strong>Halwajaat:</strong> A selection that may include Panjeeri, Khajoor Halwa, Badam Paak, and other specialities.</li>
    <li><strong>Barfi:</strong> Familiar favourites and assorted varieties, including nut-based selections.</li>
    <li><strong>Traditional Sweets:</strong> Classic delicacies selected from our supplier catalogues.</li>
  
    <li><strong>Gift Boxes:</strong> Curated assortments to celebrate life's memorable moments.</li>
  </ul>
  <p class="rs-note">Our listed categories are a guide to our developing catalogue. Individual products, sizes, and availability depend on supplier confirmation.</p>


  <div class="rs-gold-line"></div>
  <h2>Our Mission</h2>
  <p><strong>To make the joy of traditional Pakistani sweets more accessible while celebrating the rich heritage of Multan and putting customer trust at the centre of our retail experience.</strong></p>
  <ul class="rs-bullets">
    <li>Celebrate the flavours and stories behind Pakistan's traditional mithaas.</li>
    <li>Bring a diverse selection of supplier-sourced sweets into one organized store.</li>
    <li>Help customers explore traditional sweets across our product categories.</li>
    <li>Make online discovery, selection, and ordering simple and welcoming.</li>
    <li>Provide clear product information and responsible order communication.</li>
    <li>Present traditional sweets through a refined, culturally inspired brand experience.</li>
    <li>Develop gifting selections for celebrations, family visits, and thoughtful surprises.</li>
  </ul>

  <h2>Our Vision</h2>
  <p>We aspire to build a respected Pakistani sweets retail destination — one known for its appreciation of tradition, elegant presentation, transparent sourcing, and customer-focused service.</p>
  <p>Our vision is to connect generations through familiar flavours while helping more people discover the charm of Multani sweets and other beloved Pakistani delicacies.</p>

  <h2>Our Core Values</h2>
  <div class="rs-values">
    <div class="rs-value"><strong>Tradition</strong><p>Celebrating the cultural roots of Pakistani sweet-making.</p></div>
    <div class="rs-value"><strong>Transparency</strong><p>Being clear about product origins and confirmed details.</p></div>
    <div class="rs-value"><strong>Trust</strong><p>Earning confidence through honest communication.</p></div>
    <div class="rs-value"><strong>Elegance</strong><p>Presenting our store with care, warmth, and refinement.</p></div>
    <div class="rs-value"><strong>Customer Care</strong><p>Listening, answering questions, and handling orders responsibly.</p></div>
    <div class="rs-value"><strong>Growth</strong><p>Improving our collections, processes, and shopping experience.</p></div>
  </div>

  <h2>Sweet Moments Worth Sharing</h2>
  <p>Whether it is Eid, a wedding, a birthday, a family gathering, a thoughtful visit, or a simple tea-time treat, sharing mithaas can make an everyday moment feel special. We aim to help customers find sweet selections suited to those moments.</p>
  <ul class="rs-bullets">
    <li>Festive and family celebrations.</li>
    <li>Gifts for parents, relatives, friends, and loved ones.</li>
    <li>Wedding-related visits and special occasions.</li>
    <li>Corporate gifting inquiries and appreciation gestures.</li>
    <li>Sharing a taste of Multan with family across Pakistan.</li>
  </ul>

  <div class="rs-soft-panel">
    <h2>Our Promise of Transparency</h2>
    <p><strong>Riwayat-e-Sohan is a retail brand, not a sweets manufacturer.</strong> Products are sourced from independent suppliers. We do not represent their recipes, kitchens, or manufacturing processes as our own.</p>
    <p>Product sourcing details are provided when verified. Ingredients, allergens, shelf life, exact weights, and packaging specifications will be published or shared once the relevant supplier information is confirmed.</p>
    <p style="margin-bottom:0">Our visual branding and packaging concepts express the Riwayat-e-Sohan identity; they do not by themselves confirm that a particular packaging design is currently in use.</p>
  </div>

  <h2>Shopping with Riwayat-e-Sohan</h2>
  <ul class="rs-bullets">
    <li><strong>Browse:</strong> Explore sweets by category or verified supplier collection.</li>
    <li><strong>Choose:</strong> Select products and check the confirmed details for your order.</li>
    <li><strong>Order:</strong> The standard minimum combined order is 1 KG, subject to special pack rules.</li>
    <li><strong>Confirm:</strong> Our team confirms availability and applicable order details.</li>
    <li><strong>Pay:</strong> Payment is in advance. Cash on Delivery is not available.</li>
    <li><strong>Delivery:</strong> Standard TCS delivery charges are included in listed selling prices under our delivery policy, subject to courier coverage and confirmation.</li>
  </ul>

  <div class="rs-cta">
    <h2>Riwayat-e-Sohan</h2>
    <p><strong style="color:#f5d69d">Har Mithaas Mein Riwaayat</strong></p>
    <p>Rooted in tradition. Inspired by Multan. Created for sweet moments worth sharing.</p>
    <a href="shop.html">Explore Our Collection</a>
  </div>
</article>
` : type === 'contact' ? `
<style>
.rs-contact{font-family:inherit;color:#392b2a}.rs-contact *{box-sizing:border-box}
.rs-contact-hero{background:radial-gradient(circle at 90% 5%,#9b5360 0,transparent 38%),linear-gradient(120deg,#3b0b1c,#70243b);border:1px solid #caa364;border-radius:20px;padding:65px 34px;text-align:center;color:#fff7e8;position:relative;overflow:hidden}
.rs-contact-hero:before,.rs-contact-hero:after{content:'✦';position:absolute;font-size:60px;color:#d8ae69;opacity:.38;top:16px}.rs-contact-hero:before{left:26px}.rs-contact-hero:after{right:26px}
.rs-contact-kicker{color:#eac88c;text-transform:uppercase;letter-spacing:2.8px;font-size:12px;font-weight:700}.rs-contact-hero h1{font-family:Georgia,serif;color:#f7d9a3;font-size:clamp(36px,6vw,56px);margin:13px 0}.rs-contact-hero p{max-width:650px;margin:0 auto 22px;line-height:1.8;color:#fff3e5}
.rs-contact-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;border-radius:9px;padding:13px 21px;background:#e9c98b;color:#4c1027!important;font-weight:700;text-decoration:none;transition:transform .2s,box-shadow .2s;border:1px solid #d6b371}.rs-contact-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px #20081133}
.rs-contact-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:24px;margin:28px 0}.rs-contact-panel{background:#fffaf2;border:1px solid #e6d2ae;border-radius:17px;padding:28px;box-shadow:0 8px 24px #4a17200c}.rs-contact-panel h2{font-family:Georgia,serif;color:#651b2c;font-size:27px;margin:0 0 12px}.rs-contact-panel p{color:#69554d;line-height:1.75}
.rs-contact-method{padding:18px 0;border-bottom:1px solid #e8d8c1}.rs-contact-method:last-child{border-bottom:0}.rs-contact-method strong{display:block;color:#572033;margin-bottom:6px}.rs-contact-method a{color:#77283c;overflow-wrap:anywhere}.rs-contact-note{background:#f7ecd9;border-left:4px solid #b78d4b;border-radius:9px;padding:15px;margin-top:20px;color:#654d40;font-size:14px;line-height:1.7}
.rs-contact-form{display:grid;grid-template-columns:1fr 1fr;gap:15px}.rs-contact-field{display:flex;flex-direction:column;gap:7px}.rs-contact-wide{grid-column:1/-1}.rs-contact-field label{font-size:13px;font-weight:700;color:#5c2a36}.rs-contact-field input,.rs-contact-field select,.rs-contact-field textarea{width:100%;border:1px solid #d8c4a7;border-radius:9px;padding:12px 13px;background:white;color:#392b2a;font:inherit;font-size:15px}.rs-contact-field :is(input,select,textarea):focus{outline:2px solid #c59a57;outline-offset:1px}.rs-contact-field textarea{resize:vertical;min-height:130px}.rs-contact-submit{border:0;cursor:pointer;font:700 15px inherit;width:100%;background:#651b2c;color:#fff8ec;padding:15px;border-radius:9px}.rs-contact-submit:hover{background:#822b42}
.rs-contact-benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:8px 0 25px}.rs-contact-benefit{padding:22px 18px;text-align:center;background:#fffaf2;border:1px solid #e8d5b5;border-radius:14px}.rs-contact-benefit span{font-size:28px}.rs-contact-benefit h3{font-size:16px;color:#651b2c;margin:9px 0}.rs-contact-benefit p{font-size:13px;line-height:1.65;color:#715e55;margin:0}.rs-contact-end{text-align:center;padding:30px 15px 15px;color:#6d2539;font-family:Georgia,serif;font-size:20px}
@media(max-width:760px){.rs-contact-layout{grid-template-columns:1fr}.rs-contact-benefits{grid-template-columns:1fr}.rs-contact-hero{padding:46px 20px}.rs-contact-panel{padding:22px}.rs-contact-form{grid-template-columns:1fr}}
</style>
<div class="rs-contact">
<section class="rs-contact-hero"><div class="rs-contact-kicker">Riwayat-e-Sohan · روایتِ سوہن</div><h1>We'd Love to Hear From You</h1><p>Have a question about our traditional sweets, an upcoming celebration, or your order? We're here to help make every sweet moment special.</p><a class="rs-contact-btn" href="https://wa.me/923004238576" target="_blank" rel="noopener noreferrer">💬 Chat With Us on WhatsApp</a></section>
<div class="rs-contact-layout"><section class="rs-contact-panel"><h2>Get in Touch</h2><p>For product availability, pricing, gift boxes, and delivery inquiries, reach out using the options below.</p><div class="rs-contact-method"><strong>💬 WhatsApp Orders & Support</strong><a href="https://wa.me/923004238576" target="_blank" rel="noopener noreferrer">+92 300 4238576</a><p>Message us directly for assistance.</p></div><div class="rs-contact-method"><strong>🛍️ Explore Our Collection</strong><a href="shop.html">Browse Sohan Halwa, Barfi & Sweets</a></div><div class="rs-contact-method"><strong>📦 Delivery & Payments</strong><p>Minimum combined order: 1 KG. Advance payment via JazzCash or Easypaisa after confirmation. No Cash on Delivery. Standard TCS delivery is included in listed prices, subject to confirmation.</p></div><div class="rs-contact-note">🔒 For your security, please confirm the final amount and payment account details with our team before transferring funds.</div></section>
<section class="rs-contact-panel"><h2>Send an Inquiry</h2><p>Fill in the form below. Your WhatsApp app will open with your message ready to send; please press Send there to complete your inquiry.</p><form id="rs-contact-form" class="rs-contact-form"><div class="rs-contact-field"><label for="rs-contact-name">Full Name *</label><input id="rs-contact-name" name="name" required maxlength="100" autocomplete="name" placeholder="Your full name"></div><div class="rs-contact-field"><label for="rs-contact-phone">Phone Number *</label><input id="rs-contact-phone" name="phone" type="tel" required maxlength="30" autocomplete="tel" placeholder="03XX XXXXXXX"></div><div class="rs-contact-field rs-contact-wide"><label for="rs-contact-topic">How Can We Help? *</label><select id="rs-contact-topic" name="topic" required><option value="">Select an inquiry type</option><option>Product Information</option><option>Order Assistance</option><option>Delivery Question</option><option>Gift Boxes & Bulk Orders</option><option>Other Inquiry</option></select></div><div class="rs-contact-field rs-contact-wide"><label for="rs-contact-message">Your Message *</label><textarea id="rs-contact-message" name="message" required maxlength="2000" placeholder="Tell us how we can help..."></textarea></div><div class="rs-contact-wide"><button class="rs-contact-submit" type="submit">💬 Continue to WhatsApp</button></div></form></section></div>
<div class="rs-contact-benefits"><div class="rs-contact-benefit"><span>🍯</span><h3>Traditional Favourites</h3><p>Discover classic Multani sweets and thoughtful gifting options.</p></div><div class="rs-contact-benefit"><span>🎁</span><h3>Special Occasion Inquiries</h3><p>Ask about gift assortments and bulk-order availability.</p></div><div class="rs-contact-benefit"><span>🚚</span><h3>Order Guidance</h3><p>Get help with delivery details and payment confirmation.</p></div></div><div class="rs-contact-end">Riwayat-e-Sohan · Har Mithaas Mein Riwayat ✦</div>
</div>
` : `<h1 class="page-title">Delivery & Store Policies</h1><h3>Ordering</h3><p>Minimum combined order: 1 KG. Product availability, final pricing and packaging will be confirmed on WhatsApp.</p><h3>Delivery</h3><p>TCS delivery charges are included in displayed product prices. No separate TCS delivery fee is added. Delivery timing is subject to courier confirmation.</p><h3>Payment</h3><p>JazzCash and Easypaisa advance payments only. Cash on Delivery is not offered. Please wait for the final payable amount before transferring funds. Orders dispatch after payment verification.</p><h3>Visitor Analytics & Privacy</h3><p>We count website visits using a randomly generated browser identifier to understand visitor totals. We do not know visitors' names or contact details unless they submit an order. Order details are stored for processing and are accessible to the store administrator.</p><h3>Returns & Issues</h3><p>Contact us promptly on WhatsApp with order details if there is an issue. A full returns/refund policy will be published after the business confirms its operational rules and applicable consumer requirements.</p>`; layout(`<main class="wrap"><div class="crumb"><a href="index.html">Home</a> / Information</div><div class="panel" style="max-width:820px;margin:35px auto 80px;line-height:1.9">${content}</div></main>`); if (type === 'contact') { const form = document.getElementById('rs-contact-form'); if (form) form.addEventListener('submit', e => { e.preventDefault(); if (!form.reportValidity()) return; const d = new FormData(form); const msg = 'Assalam o Alaikum! I would like to contact Riwayat-e-Sohan.\n\nName: ' + d.get('name') + '\nPhone: ' + d.get('phone') + '\nInquiry: ' + d.get('topic') + '\nMessage: ' + d.get('message'); window.open('https://wa.me/923004238576?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer'); }); }
}
function brandsPage() {
  layout(`<main class="wrap"><div class="crumb"><a href="index.html">Home</a> / Shop by Brand</div><h1 class="page-title">Shop by Brand</h1><p class="sub">Discover sweets from our three supplier collections.</p><div class="rs-brand-grid">${supplierBrands.map(b => `<a class="rs-brand-tile" href="${brandUrl(b.id)}"><span>Supplier Collection</span><strong>${safe(b.name)}</strong><small>View Collection →</small></a>`).join('')}</div></main><div style="height:80px"></div>`);
}
function brandPage() {
  const id = new URLSearchParams(location.search).get('brand');
  const b = supplierBrands.find(x => x.id === id);
  if (!b) { brandsPage(); return; }
  const arr = products.filter(p => p.brand === id);
  layout(`<main class="wrap"><div class="crumb"><a href="index.html">Home</a> /  / ${safe(b.name)}</div><h1 class="page-title">${safe(b.name)}</h1><p class="sub">${arr.length} products in this collection</p>${arr.length ? `<div class="products">${arr.map(productCard).join('')}</div>` : `<div class="panel"><h2>Collection coming soon</h2><p>We are confirming which products belong to ${safe(b.name)}. Browse all sweets in the meantime.</p><a class="btn dark" href="shop.html">Shop All Products</a></div>`}</main><div style="height:80px"></div>`);
}
function ensureBrandStyles() {
  if (document.getElementById('rs-brand-styles')) return;
  const e = document.createElement('style'); e.id = 'rs-brand-styles'; e.textContent = `.rs-brand-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:22px 0 45px}.rs-brand-tile{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;min-height:180px;border:2px solid #cba45e;border-radius:14px;background:linear-gradient(135deg,#571629,#792b40);color:#fff5df;text-decoration:none;padding:22px;box-shadow:0 8px 24px #38142118}.rs-brand-tile span{font-size:12px;letter-spacing:1.2px;color:#ebd7a7}.rs-brand-tile strong{font-size:29px;color:#f3d493;margin:12px 0}.rs-brand-tile small{font-size:13px;color:#fff}.rs-brand-tile:hover{transform:translateY(-3px)}.rs-brand-by{color:#6d2536;font-weight:600}@media(max-width:650px){.rs-brand-grid{grid-template-columns:1fr}.rs-brand-tile{min-height:135px}}`;
  document.head.appendChild(e);
}

ensureBrandStyles();
fetch('./assests/json/products.json').then(r => r.json()).then(d => { products = d.filter(p => !hiddenCats.includes(p.category)); const page = document.body.dataset.page; if (page === 'home') home(); else if (page === 'brands' || page === 'brand') catalog(); else if (page === 'shop') catalog(); else if (page === 'category') { if (hiddenCats.includes(document.body.dataset.category)) window.location.replace('shop.html'); else catalog(document.body.dataset.category); } else if (page === 'product') product(); else if (page === 'cart') cart(); else infoPage(page) }).catch(() => { document.querySelector('#app').innerHTML = '<div class="wrap"><h1>Unable to load catalogue</h1><p>Please open this website through a local server or your web host. See README.txt.</p></div>' });