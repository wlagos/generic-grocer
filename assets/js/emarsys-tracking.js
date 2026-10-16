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

  // Per Emarsys docs, 'go' should be "the last call on the page, called only
  // once" — not once per batch of nearby events, but once ever for the
  // page's whole lifetime. Once scarab-v2.js finishes loading, it takes
  // over window.ScarabQueue and processes further pushes in real time, so
  // every 'go' after the first is both unnecessary and actively rejected
  // by Scarab ("Multiple calls of go command") — confirmed by it firing
  // again several seconds after an earlier unrelated event's 'go', not just
  // when two calls land in the same tick. goCalled latches permanently;
  // goScheduled only coalesces calls arriving before that first 'go' fires.
  var goCalled = false;
  var goScheduled = false;
  function scheduleGo(queue) {
    if (goCalled || goScheduled) return;
    goScheduled = true;
    setTimeout(function () {
      goScheduled = false;
      goCalled = true;
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
