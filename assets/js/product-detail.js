(function () {
  'use strict';

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function getProductId() {
    var match = /(?:^|[?&])id=([^&]*)/.exec(window.location.search);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function renderProduct(product) {
    var detail = document.getElementById('product-detail');
    detail.innerHTML =
      '<div class="fp-item-container" style="display:flex;gap:32px;flex-wrap:wrap;align-items:flex-start;">' +
        '<div class="fp-item-content" style="display:flex;gap:32px;flex-wrap:wrap;">' +
          '<div class="fp-item-image fp-item-image-md">' +
            '<img alt="' + escapeHtml(product.name) + '" src="' + escapeHtml(product.image) + '" style="width:320px;max-width:100%;"/>' +
          '</div>' +
          '<div class="fp-item-detail">' +
            '<div class="fp-item-name notranslate" style="font-size:24px;margin-bottom:12px;">' + escapeHtml(product.name) + '</div>' +
            '<div class="fp-item-price" style="font-size:20px;font-weight:bold;">$' + Number(product.price || 0).toFixed(2) + '</div>' +
          '</div>' +
          '<div class="fp-item-action-group">' +
            '<div class="fp-item-action" data-product-id="' + escapeHtml(product.id) + '">' +
              '<span aria-label="Add to Cart: ' + escapeHtml(product.name) + '" class="fp-btn-icon fp-btn-increment" data-action="add-to-cart" role="button" tabindex="0"><span class="sr-only"></span></span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    if (window.EmarsysTrack) window.EmarsysTrack.viewProduct(product.id, product.category);

    function handleAddToCart() {
      var actionEl = detail.querySelector('.fp-item-action');
      var trigger = detail.querySelector('[data-action="add-to-cart"]');
      if (!window.Cart) return;
      window.Cart.add(product);
      actionEl.classList.add('is-added');
      trigger.setAttribute('aria-label', 'Added to Cart: ' + product.name);
    }

    detail.addEventListener('click', function (e) {
      if (e.target.closest('[data-action="add-to-cart"]')) handleAddToCart();
    });
    detail.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-action="add-to-cart"]')) {
        e.preventDefault();
        handleAddToCart();
      }
    });
  }

  function init() {
    var detail = document.getElementById('product-detail');
    var notFound = document.getElementById('product-not-found');
    if (!detail) return;

    var id = getProductId();

    fetch('../assets/data/search-index.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var product = data.filter(function (p) { return String(p.id) === id; })[0];
        if (!product) {
          detail.style.display = 'none';
          if (notFound) notFound.style.display = '';
          return;
        }
        renderProduct(product);
      })
      .catch(function () {
        detail.style.display = 'none';
        if (notFound) notFound.style.display = '';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
