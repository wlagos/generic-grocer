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

  // Independent async flows (gigya session check, product-data fetch, cart
  // actions, etc.) can each want to flush around the same time with no
  // fixed ordering between them — every tracking call used to append its
  // own 'go', and two landing in the same tick makes Scarab log a
  // "Multiple calls of go command" error. In testing, that error is benign:
  // every occurrence of it came with a correctly-recorded event (view/cart/
  // purchase) at the same timestamp — it's a logged warning, not a dropped
  // event. A permanent "only ever call go once per page" latch was tried
  // and made things worse: every tracking call *after* the first one
  // (add/remove/checkout) stopped being recorded entirely, so Scarab does
  // need a 'go' per logical batch, not just one ever. scheduleGo() only
  // coalesces calls landing in the exact same tick, letting go fire again
  // for each later, separate user action.
  var goScheduled = false;
  function scheduleGo(queue) {
    if (goScheduled) return;
    goScheduled = true;
    setTimeout(function () {
      goScheduled = false;
      queue.push(['go']);
    }, 0);
  }

  function push(command, payload) {
    withScarabQueue(function (queue) {
      queue.push([command, payload]);
      scheduleGo(queue);
    });
  }

  function searchTerm(term) {
    if (!term) return;
    push('searchTerm', term);
  }

  function viewProduct(id, categoryId) {
    if (!id) return;
    withScarabQueue(function (queue) {
      if (categoryId) {
        queue.push(['category', String(categoryId)]);
      }
      queue.push(['view', String(id)]);
      scheduleGo(queue);
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
      scheduleGo(queue);
    });
  }

  function purchase(orderId, items) {
    push('purchase', { orderId: orderId, items: cartItemsFor(items) });
  }

  // Per Emarsys docs: the 'cart' command on a purchase must report an EMPTY
  // cart ([]), not the items just purchased — "remember to empty the cart
  // on purchase." The real items/prices go in the 'purchase' payload only.
  function checkout(orderId, items) {
    withScarabQueue(function (queue) {
      queue.push(['cart', []]);
      queue.push(['purchase', { orderId: orderId, items: cartItemsFor(items) }]);
      scheduleGo(queue);
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
