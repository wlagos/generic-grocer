(function () {
  'use strict';

  function withScarabQueue(callback, retries) {
    retries = retries || 0;
    if (!window.ScarabQueue) {
      if (retries >= 50) return;
      setTimeout(function () { withScarabQueue(callback, retries + 1); }, 200);
      return;
    }
    callback(window.ScarabQueue);
  }

  function push(command, payload) {
    withScarabQueue(function (queue) {
      queue.push([command, payload]);
      queue.push(['go']);
    });
  }

  function searchTerm(term) {
    if (!term) return;
    push('searchTerm', term);
  }

  function viewProduct(id) {
    if (!id) return;
    push('view', String(id));
  }

  function cartItemsFor(items) {
    return items.map(function (item) {
      return { item: String(item.id), price: item.price || 0, quantity: item.qty };
    });
  }

  function cartSnapshot() {
    if (!window.Cart) return;
    push('cart', cartItemsFor(window.Cart.get()));
  }

  function identify(email, customerId) {
    withScarabQueue(function (queue) {
      queue.push(['setEmail', email]);
      queue.push(['setCustomerId', customerId]);
      queue.push(['go']);
    });
  }

  function purchase(orderId, items) {
    push('purchase', { orderId: orderId, items: cartItemsFor(items) });
  }

  // Checkout fires 'cart' + 'purchase' together — a single trailing 'go',
  // not two (pushing them via separate searchTerm/cartSnapshot-style calls
  // each append their own 'go', which Scarab rejects as "Multiple calls of
  // go command" when two tracking calls land in the same tick).
  function checkout(orderId, items) {
    withScarabQueue(function (queue) {
      var cartItems = cartItemsFor(items);
      queue.push(['cart', cartItems]);
      queue.push(['purchase', { orderId: orderId, items: cartItems }]);
      queue.push(['go']);
    });
  }

  window.EmarsysTrack = {
    searchTerm: searchTerm,
    viewProduct: viewProduct,
    cartSnapshot: cartSnapshot,
    identify: identify,
    purchase: purchase,
    checkout: checkout
  };
})();
