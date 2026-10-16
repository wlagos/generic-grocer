(function () {
  'use strict';

  var PER_PAGE_OPTIONS = [6, 12, 18, 24, 48, 96];
  var DEFAULT_PER_PAGE = 24;

  function resolveFromRoot(relativeFromPages) {
    var inPages = /\/pages\//.test(window.location.pathname) || /^pages\//.test(window.location.pathname) || /^pages\\/.test(window.location.pathname);
    return inPages ? relativeFromPages : 'pages/' + relativeFromPages;
  }

  // ---- Header search box: wire the existing (inert) fp-search forms ----

  function wireSearchForms() {
    var forms = document.querySelectorAll('form[name="fp-search"]');
    forms.forEach(function (form) {
      var textInput = form.querySelector('.fp-input-search.fp-tt-input');
      var submitBtn = form.querySelector('[data-action="submit-search"]');
      var dropdownInput = form.querySelector('input[name="fp-input-search-dropdown"]');
      if (!textInput || !submitBtn) return;

      function submit() {
        var q = textInput.value.trim();
        if (!q) return;
        var mode = dropdownInput ? dropdownInput.value : 'product';
        if (window.EmarsysTrack) window.EmarsysTrack.searchTerm(q);
        window.location.href = resolveFromRoot('search-results.html') +
          '#!/?q=' + encodeURIComponent(q) + '&search_option_id=' + encodeURIComponent(mode);
      }

      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        submit();
      });

      textInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          submit();
        }
      });
    });
  }

  // ---- Search results page ----

  function parseHashParams() {
    var hash = window.location.hash || '';
    var queryStart = hash.indexOf('?');
    var params = { q: '', search_option_id: 'product' };
    if (queryStart === -1) return params;
    hash.slice(queryStart + 1).split('&').forEach(function (pair) {
      if (!pair) return;
      var idx = pair.indexOf('=');
      var key = decodeURIComponent(idx === -1 ? pair : pair.slice(0, idx));
      var val = idx === -1 ? '' : decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '));
      params[key] = val;
    });
    return params;
  }

  function matchesQuery(product, query) {
    if (!query) return true;
    var haystack = product.name.toLowerCase();
    return query.toLowerCase().split(/\s+/).filter(Boolean).every(function (token) {
      return haystack.indexOf(token) !== -1;
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderItem(product) {
    var productLink = resolveFromRoot('product.html?id=' + encodeURIComponent(product.id));
    return (
      '<li class="fp-item" data-product-id="' + escapeHtml(product.id) + '">' +
        '<div class="fp-item-container">' +
          '<div class="fp-item-content">' +
            '<div class="fp-item-image fp-item-image-md">' +
              '<a href="' + productLink + '">' +
                '<img alt="' + escapeHtml(product.name) + '" src="' + escapeHtml(product.image) + '"/>' +
              '</a>' +
            '</div>' +
            '<div class="fp-item-detail">' +
              '<div class="fp-item-name notranslate">' +
                '<span aria-level="2" role="heading"><a href="' + productLink + '">' + escapeHtml(product.name) + '</a></span>' +
              '</div>' +
              '<div class="fp-item-price">$' + Number(product.price || 0).toFixed(2) + '</div>' +
            '</div>' +
            '<div class="fp-item-action-group">' +
              '<div class="fp-item-action" data-product-id="' + escapeHtml(product.id) + '">' +
                '<span aria-label="Add to Cart: ' + escapeHtml(product.name) + '" class="fp-btn-icon fp-btn-increment" data-action="add-to-cart" role="button" tabindex="0"><span class="sr-only"></span></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</li>'
    );
  }

  function initSearchResultsPage() {
    var list = document.getElementById('search-results-list');
    if (!list) return;

    var countEl = document.getElementById('search-results-count');
    var queryEl = document.getElementById('search-results-query');
    var perPageSelect = document.getElementById('search-per-page');
    var sortSelect = document.getElementById('search-sort');

    var state = { all: [], page: 1, perPage: DEFAULT_PER_PAGE, sort: 'popularity' };

    function sortResults(results) {
      if (state.sort === 'name') {
        return results.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
      }
      return results;
    }

    function render() {
      var params = parseHashParams();
      var query = params.q || '';
      if (queryEl) queryEl.textContent = query;

      var filtered = params.search_option_id && params.search_option_id !== 'product'
        ? []
        : sortResults(state.all.filter(function (p) { return matchesQuery(p, query); }));

      if (countEl) countEl.textContent = filtered.length;

      var totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
      if (state.page > totalPages) state.page = totalPages;
      var start = (state.page - 1) * state.perPage;
      var pageItems = filtered.slice(start, start + state.perPage);

      if (!query) {
        list.innerHTML = '';
      } else if (pageItems.length === 0) {
        list.innerHTML = '<li class="fp-no-results">No products found for "' + escapeHtml(query) + '".</li>';
      } else {
        list.innerHTML = pageItems.map(renderItem).join('');
      }
    }

    function handleAddToCart(trigger) {
      var actionEl = trigger.closest('.fp-item-action');
      if (!actionEl) return;
      var productId = actionEl.getAttribute('data-product-id');
      var product = state.all.filter(function (p) { return String(p.id) === productId; })[0];
      if (!product || !window.Cart) return;
      window.Cart.add(product);
      actionEl.classList.add('is-added');
      trigger.setAttribute('aria-label', 'Added to Cart: ' + product.name);
    }

    list.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-action="add-to-cart"]');
      if (trigger) handleAddToCart(trigger);
    });

    list.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var trigger = e.target.closest('[data-action="add-to-cart"]');
      if (!trigger) return;
      e.preventDefault();
      handleAddToCart(trigger);
    });

    if (perPageSelect) {
      perPageSelect.addEventListener('change', function () {
        var value = parseInt(perPageSelect.value, 10);
        if (PER_PAGE_OPTIONS.indexOf(value) === -1) return;
        state.perPage = value;
        state.page = 1;
        render();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value || 'popularity';
        render();
      });
    }

    window.addEventListener('hashchange', function () {
      state.page = 1;
      render();
    });

    fetch('../assets/data/search-index.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.all = data;
        render();
      })
      .catch(function () {
        list.innerHTML = '<li class="fp-no-results">Search is temporarily unavailable.</li>';
      });
  }

  function init() {
    wireSearchForms();
    initSearchResultsPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
