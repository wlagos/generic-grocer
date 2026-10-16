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

  // Batches 'category' + 'view' into one 'go' when a category id is known
  // (same reason checkout() batches cart+purchase — two separate push()
  // calls would each append their own 'go', which Scarab rejects).
  function viewProduct(id, categoryId) {
    if (!id) return;
    withScarabQueue(function (queue) {
      if (categoryId) {
        queue.push(['category', String(categoryId)]);
      }
      queue.push(['view', String(id)]);
      queue.push(['go']);
    });
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
  // Per Emarsys docs: the 'cart' command on a purchase must report an EMPTY
  // cart ([]), not the items just purchased — "remember to empty the cart
  // on purchase." The real items/prices go in the 'purchase' payload only.
  function checkout(orderId, items) {
    withScarabQueue(function (queue) {
      queue.push(['cart', []]);
      queue.push(['purchase', { orderId: orderId, items: cartItemsFor(items) }]);
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
