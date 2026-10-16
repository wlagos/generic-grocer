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
      items.push({ id: product.id, name: product.name, image: product.image, url: product.url, price: product.price || 0, qty: 1 });
    }
    save(items);
    updateBadge();
    renderMiniLists();
    renderCartPage();
    if (window.EmarsysTrack) window.EmarsysTrack.cartSnapshot();
  }

  function remove(id) {
    var items = get().filter(function (item) { return String(item.id) !== String(id); });
    save(items);
    updateBadge();
    renderMiniLists();
    renderCartPage();
    if (window.EmarsysTrack) window.EmarsysTrack.cartSnapshot();
  }

  function clearCart() {
    save([]);
    updateBadge();
    renderMiniLists();
    renderCartPage();
  }

  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add('cart-toast-visible'); }, 10);
    setTimeout(function () {
      toast.classList.remove('cart-toast-visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  function performCheckout() {
    function finish() {
      clearCart();
      showToast('Checkout is done! Your cart has been cleared.');
    }
    if (typeof gigya !== 'undefined' && gigya.accounts && gigya.accounts.getAccountInfo) {
      gigya.accounts.getAccountInfo({
        callback: function (res) {
          if (res && res.errorCode === 0 && window.EmarsysTrack) {
            window.EmarsysTrack.cartSnapshot();
          }
          finish();
        }
      });
    } else {
      finish();
    }
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

  function formatPrice(n) {
    return '$' + Number(n || 0).toFixed(2);
  }

  function cartTotal(items) {
    return items.reduce(function (sum, item) { return sum + (item.price || 0) * item.qty; }, 0);
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
            '<div class="cart-mini-list-qty">Qty: ' + escapeHtml(item.qty) + ' &times; ' + formatPrice(item.price) + '</div>' +
          '</div>' +
          '<button aria-label="Remove ' + escapeHtml(item.name) + ' from cart" class="cart-mini-list-remove" data-action="remove-item" data-product-id="' + escapeHtml(item.id) + '" type="button">&times;</button>' +
        '</div>'
      );
    }).join('');
    panel.innerHTML = rows +
      '<div class="cart-mini-list-total">Total: ' + formatPrice(cartTotal(items)) + '</div>' +
      '<button class="cart-mini-list-checkout" data-action="checkout" type="button">Checkout</button>';
  }

  function renderCartPage() {
    var container = document.getElementById('cart-page-list');
    if (!container) return;
    var items = get();
    if (items.length === 0) {
      container.innerHTML = '<div class="cart-mini-list-empty">Your cart is empty. <a href="' + (/\/pages\//.test(window.location.pathname) ? '../index.html' : 'index.html') + '">Continue shopping</a>.</div>';
      return;
    }
    var rows = items.map(function (item) {
      return (
        '<div class="cart-page-row" data-product-id="' + escapeHtml(item.id) + '">' +
          '<img alt="' + escapeHtml(item.name) + '" class="cart-page-image" src="' + escapeHtml(item.image) + '"/>' +
          '<div class="cart-page-info">' +
            '<div class="cart-page-name">' + escapeHtml(item.name) + '</div>' +
            '<div class="cart-page-qty">Qty: ' + escapeHtml(item.qty) + ' &times; ' + formatPrice(item.price) + '</div>' +
          '</div>' +
          '<button aria-label="Remove ' + escapeHtml(item.name) + ' from cart" class="cart-page-remove" data-action="remove-item" data-product-id="' + escapeHtml(item.id) + '" type="button">Remove</button>' +
        '</div>'
      );
    }).join('');
    container.innerHTML = rows +
      '<div class="cart-page-total">Total: ' + formatPrice(cartTotal(items)) + '</div>' +
      '<button class="cart-page-checkout" data-action="checkout" type="button">Checkout</button>';
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
      '.cart-mini-list-total { padding: 10px 12px; font-weight: bold; color: #1D1D1F; border-top: 1px solid #ddd; text-align: right; }' +
      '.cart-mini-list-checkout { display: block; width: 100%; text-align: center; padding: 12px; font-weight: bold; color: #fff !important; background: #C4161B; border: none; text-decoration: none !important; cursor: pointer; font-size: 14px; }' +
      '.cart-mini-list-checkout:hover { background: #8A0E12; }' +
      '.cart-page-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid #eee; }' +
      '.cart-page-image { width: 80px; height: 80px; object-fit: contain; flex-shrink: 0; }' +
      '.cart-page-info { flex: 1; min-width: 0; }' +
      '.cart-page-name { font-size: 16px; color: #1D1D1F; }' +
      '.cart-page-qty { font-size: 14px; color: #666; }' +
      '.cart-page-remove { background: #fff; border: 2px solid #C4161B; color: #C4161B; border-radius: 4px; padding: 8px 16px; cursor: pointer; }' +
      '.cart-page-total { margin-top: 16px; padding-top: 16px; border-top: 2px solid #1D1D1F; font-size: 18px; font-weight: bold; color: #1D1D1F; text-align: right; }' +
      '.cart-page-checkout { display: block; margin-top: 20px; padding: 14px 24px; font-weight: bold; font-size: 16px; color: #fff; background: #C4161B; border: none; border-radius: 4px; cursor: pointer; }' +
      '.cart-page-checkout:hover { background: #8A0E12; }' +
      '.cart-toast { position: fixed; left: 50%; bottom: 30px; transform: translate(-50%, 20px); background: #1D1D1F; color: #fff; padding: 14px 24px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 2000; opacity: 0; transition: opacity 0.3s, transform 0.3s; }' +
      '.cart-toast-visible { opacity: 1; transform: translate(-50%, 0); }';
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

      var checkoutBtn = e.target.closest && e.target.closest('[data-action="checkout"]');
      if (checkoutBtn) {
        performCheckout();
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
