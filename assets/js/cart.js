(function () {
  'use strict';

  var STORAGE_KEY = 'cart';

  function get() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function add(product) {
    var items = get();
    var existing = items.filter(function (item) { return item.id === product.id; })[0];
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ id: product.id, name: product.name, image: product.image, url: product.url, qty: 1 });
    }
    save(items);
    updateBadge();
    renderMiniLists();
    renderCartPage();
  }

  function remove(id) {
    var items = get().filter(function (item) { return String(item.id) !== String(id); });
    save(items);
    updateBadge();
    renderMiniLists();
    renderCartPage();
  }

  function resolveCartUrl() {
    var inPages = /\/pages\//.test(window.location.pathname) || /^pages\//.test(window.location.pathname) || /^pages\\/.test(window.location.pathname);
    return inPages ? 'cart.html' : 'pages/cart.html';
  }

  function updateBadge() {
    var count = get().reduce(function (sum, item) { return sum + item.qty; }, 0);
    document.querySelectorAll('[data-role="list-quantity"]').forEach(function (el) {
      el.textContent = String(count);
    });
    document.querySelectorAll('[data-action="toggle-mini-list"]').forEach(function (btn) {
      btn.setAttribute('aria-label', 'Cart, ' + count + ' item' + (count === 1 ? '' : 's'));
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderMiniListInto(panel) {
    var items = get();
    if (items.length === 0) {
      panel.innerHTML = '<div class="cart-mini-list-empty">Your cart is empty.</div>';
      return;
    }
    var rows = items.map(function (item) {
      return (
        '<div class="cart-mini-list-row" data-product-id="' + escapeHtml(item.id) + '">' +
          '<img alt="' + escapeHtml(item.name) + '" class="cart-mini-list-image" src="' + escapeHtml(item.image) + '"/>' +
          '<div class="cart-mini-list-info">' +
            '<div class="cart-mini-list-name">' + escapeHtml(item.name) + '</div>' +
            '<div class="cart-mini-list-qty">Qty: ' + escapeHtml(item.qty) + '</div>' +
          '</div>' +
          '<button aria-label="Remove ' + escapeHtml(item.name) + ' from cart" class="cart-mini-list-remove" data-action="remove-item" data-product-id="' + escapeHtml(item.id) + '" type="button">&times;</button>' +
        '</div>'
      );
    }).join('');
    panel.innerHTML = rows + '<a class="cart-mini-list-checkout" href="' + resolveCartUrl() + '">Checkout</a>';
  }

  function renderCartPage() {
    var container = document.getElementById('cart-page-list');
    if (!container) return;
    var items = get();
    if (items.length === 0) {
      container.innerHTML = '<div class="cart-mini-list-empty">Your cart is empty. <a href="' + (/\/pages\//.test(window.location.pathname) ? '../index.html' : 'index.html') + '">Continue shopping</a>.</div>';
      return;
    }
    container.innerHTML = items.map(function (item) {
      return (
        '<div class="cart-page-row" data-product-id="' + escapeHtml(item.id) + '">' +
          '<img alt="' + escapeHtml(item.name) + '" class="cart-page-image" src="' + escapeHtml(item.image) + '"/>' +
          '<div class="cart-page-info">' +
            '<div class="cart-page-name">' + escapeHtml(item.name) + '</div>' +
            '<div class="cart-page-qty">Qty: ' + escapeHtml(item.qty) + '</div>' +
          '</div>' +
          '<button aria-label="Remove ' + escapeHtml(item.name) + ' from cart" class="cart-page-remove" data-action="remove-item" data-product-id="' + escapeHtml(item.id) + '" type="button">Remove</button>' +
        '</div>'
      );
    }).join('');
  }

  function renderMiniLists() {
    document.querySelectorAll('[data-role="mini-list"]').forEach(renderMiniListInto);
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.textContent =
      '.fp-mini-list-indicator { position: relative !important; }' +
      '.fp-mini-list { position: absolute !important; right: 0; top: 100%; min-width: 300px; max-height: 400px; overflow-y: auto;' +
      ' background: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; text-align: left; }' +
      '.cart-mini-list-empty { padding: 20px; color: #666; text-align: center; }' +
      '.cart-mini-list-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid #eee; }' +
      '.cart-mini-list-image { width: 48px; height: 48px; object-fit: contain; flex-shrink: 0; }' +
      '.cart-mini-list-info { flex: 1; min-width: 0; }' +
      '.cart-mini-list-name { font-size: 13px; color: #1D1D1F; }' +
      '.cart-mini-list-qty { font-size: 12px; color: #666; }' +
      '.cart-mini-list-remove { background: none; border: none; color: #C4161B; font-size: 20px; line-height: 1; cursor: pointer; padding: 4px 8px; }' +
      '.cart-mini-list-checkout { display: block; text-align: center; padding: 12px; font-weight: bold; color: #fff !important; background: #C4161B; text-decoration: none !important; }' +
      '.cart-mini-list-checkout:hover { background: #8A0E12; }' +
      '.cart-page-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #eee; }' +
      '.cart-page-image { width: 80px; height: 80px; object-fit: contain; flex-shrink: 0; }' +
      '.cart-page-info { flex: 1; min-width: 0; }' +
      '.cart-page-name { font-size: 16px; color: #1D1D1F; }' +
      '.cart-page-qty { font-size: 14px; color: #666; }' +
      '.cart-page-remove { background: #fff; border: 2px solid #C4161B; color: #C4161B; border-radius: 4px; padding: 8px 16px; cursor: pointer; }';
    document.head.appendChild(style);
  }

  function findIndicator(el) {
    while (el && el !== document.body) {
      if (el.classList && el.classList.contains('fp-mini-list-indicator')) return el;
      el = el.parentElement;
    }
    return null;
  }

  function closeAllPanels(except) {
    document.querySelectorAll('[data-role="mini-list"]').forEach(function (panel) {
      if (panel === except) return;
      panel.classList.add('hidden');
      var indicator = findIndicator(panel);
      var btn = indicator && indicator.querySelector('[data-action="toggle-mini-list"]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function wireMiniList() {
    document.addEventListener('click', function (e) {
      var removeBtn = e.target.closest && e.target.closest('[data-action="remove-item"]');
      if (removeBtn) {
        remove(removeBtn.getAttribute('data-product-id'));
        return;
      }

      var toggleBtn = e.target.closest && e.target.closest('[data-action="toggle-mini-list"]');
      if (toggleBtn) {
        var indicator = findIndicator(toggleBtn);
        var panel = indicator && indicator.querySelector('[data-role="mini-list"]');
        if (!panel) return;
        var willOpen = panel.classList.contains('hidden');
        closeAllPanels(willOpen ? panel : null);
        if (willOpen) {
          renderMiniListInto(panel);
          panel.classList.remove('hidden');
          toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
          panel.classList.add('hidden');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
        return;
      }

      if (!e.target.closest || !e.target.closest('[data-role="mini-list"]')) {
        closeAllPanels(null);
      }
    });
  }

  window.Cart = { get: get, add: add, remove: remove, updateBadge: updateBadge };

  function init() {
    injectStyles();
    updateBadge();
    wireMiniList();
    renderCartPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
