{
  // -----------------------------
  // Debug helper (optional)
  // -----------------------------
  _debugLog: function () {
    try {
      // Keep logs grouped and easy to find
      console.groupCollapsed('Screenset Debug');
      console.log('this (screenset) =', this);
      console.log('arguments =', arguments);
      console.groupEnd();
    } catch (e) { /* ignore */ }
  },

  // -----------------------------
  // onAfterScreenLoad: attach helper where `this` is reliable
  // -----------------------------
  onAfterScreenLoad: function (event, context) {
    // Attach showToast to the screenset instance
    var self = this;
    this.showToast = function (msg, opts) {
      opts = opts || {};
      var timeout = typeof opts.timeout === 'number' ? opts.timeout : 3000;
      var id = 'cdc-ui-builder-toast';
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.style.position = 'fixed';
        el.style.left = '50%';
        el.style.bottom = '24px';
        el.style.transform = 'translateX(-50%)';
        el.style.background = 'rgba(0,0,0,0.85)';
        el.style.color = '#fff';
        el.style.padding = '10px 14px';
        el.style.borderRadius = '6px';
        el.style.fontFamily = 'Arial, Helvetica, sans-serif';
        el.style.fontSize = '14px';
        el.style.zIndex = 999999;
        el.style.display = 'none';
        document.body.appendChild(el);
      }
      el.textContent = msg || '';
      el.style.display = 'block';
      clearTimeout(el._hideTimer);
      el._hideTimer = setTimeout(function () { el.style.display = 'none'; }, timeout);
    };

    // Also set a global fallback so onBeforeSubmit can use it even if `this` differs
    window.__screensetShowToast = this.showToast.bind(this);

    // Optional debug
    console.log('onAfterScreenLoad: showToast attached to screenset and window.__screensetShowToast set');
  },

  // -----------------------------
  // Called before a form is submitted.
  // Use regular function so `this` may be the screenset instance.
  // -----------------------------
  onBeforeSubmit: function (event) {
    // Debug what we received
    console.log('onBeforeSubmit called. this =', this, 'event =', event);

    // Prefer the method on `this` (screenset instance)
    var toastFn = (this && typeof this.showToast === 'function') ? this.showToast.bind(this) : null;

    // Fallback to global if not present
    if (!toastFn && typeof window !== 'undefined' && typeof window.__screensetShowToast === 'function') {
      toastFn = window.__screensetShowToast;
      console.warn('onBeforeSubmit: using global fallback window.__screensetShowToast');
    }

    // Final fallback: console-only
    if (!toastFn) {
      toastFn = function (m) { console.log('TOAST:', m); };
      console.warn('onBeforeSubmit: no toast function available, falling back to console');
    }

    // Example: call a simple test custom method if present on `this`
    if (this && typeof this.testCustomMethod === 'function') {
      try {
        var res = this.testCustomMethod();
        console.log('testCustomMethod returned:', res);
      } catch (err) {
        console.error('testCustomMethod threw:', err);
      }
    } else {
      console.log('testCustomMethod not found on this');
    }

    // Example validation: check rewards id (adjust field name to your screenset)
    // Note: different screenset versions expose form data differently; inspect event to confirm
    var data = event && (event.data || event.formData || event.formValues || event.form) || {};
    // Try common keys
    var rewardsId = data['data.rewardsid'] || data.rewardsid || data['rewardsid'] || '';

    if (!rewardsId) {
      toastFn('Rewards ID is blank. Continuing…');
      // If you want to block submit, return false here:
      // return false;
    }

    // Allow submit to continue
    return true;
  },

  // -----------------------------
  // Example simple test method attached in the same object
  // -----------------------------
  testCustomMethod: function () {
    // Simple proof that method runs
    console.log('testCustomMethod: executed (this =)', this);
    return 'test-ok';
  },

  // -----------------------------
  // Other lifecycle hooks (kept minimal)
  // -----------------------------
  onError: function (event) {
    console.error('onError', event);
    var toast = (this && this.showToast) || window.__screensetShowToast;
    if (typeof toast === 'function') toast('An error occurred');
  },

  onBeforeValidation: function (event) {
    // optional
  },

  onAfterSubmit: function (event) {
    console.log('onAfterSubmit', event);
    var toast = (this && this.showToast) || window.__screensetShowToast;
    if (typeof toast === 'function') toast('Form submitted');
  },

  onBeforeScreenLoad: function (event) { },
  onFieldChanged: function (event) { },
  onHide: function (event) { },
  onButtonClicked: function (event) { }
}
