{
  // Simple test method attached to the screenset instance
  testCustomMethod: function () {
    console.log('testCustomMethod called, this =', this);
    return 'ok';
  },

  // showToast helper attached to the screenset instance
  showToast: function (msg) {
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
  },

  // Called before a form is submitted
  onBeforeSubmit: function (event) {
    console.log('onBeforeSubmit start, this =', this);

    // Call the custom method via this
    if (typeof this.testCustomMethod === 'function') {
      var r = this.testCustomMethod();
      console.log('testCustomMethod returned', r);
    } else {
      console.warn('testCustomMethod not found on this');
    }

    // Example validation (adjust field name to your screenset)
    var data = (event && (event.data || event.formData || event.formValues)) || {};
    var rewardsId = data['data.rewardsid'] || data.rewardsid || '';
    if (!rewardsId) {
      if (typeof this.showToast === 'function') this.showToast('Rewards ID is blank. Continuing…');
      // return false; // uncomment to block submit
    }

    console.log('onBeforeSubmit end');
    return true;
  },

  // other lifecycle hooks...
  onAfterSubmit: function (event) { console.log('onAfterSubmit', event); },
  onError: function (event) { console.error('onError', event); }
}
