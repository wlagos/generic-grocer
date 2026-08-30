{
  onAfterScreenLoad: function (event, context) {
    context.custom = context.custom || {};
    context.custom.showToast = function (msg) {
      var id = 'cdc-ui-toast';
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
        el.style.zIndex = 99999;
        document.body.appendChild(el);
      }
      el.textContent = msg || '';
      el.style.display = 'block';
      clearTimeout(el._hideTimer);
      el._hideTimer = setTimeout(function () { el.style.display = 'none'; }, 3000);
    };
  },

  onBeforeSubmit: function (event, context) {
    console.log('onBeforeSubmit with context', context);
    if (context && context.custom && typeof context.custom.showToast === 'function') {
      context.custom.showToast('Called via context.custom.showToast');
    } else {
      console.warn('context.custom.showToast not available');
    }
    return true;
  },

  // other hooks...
  onError: function (event) { console.error('onError', event); }
}
