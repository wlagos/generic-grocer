(function () {
  'use strict';

  function withGigya(callback, retries) {
    retries = retries || 0;
    if (typeof gigya === 'undefined' || !gigya.accounts) {
      if (retries >= 50) return;
      setTimeout(function () { withGigya(callback, retries + 1); }, 200);
      return;
    }
    callback(gigya);
  }

  function syncLoginUI() {
    withGigya(function (gigya) {
      gigya.accounts.getAccountInfo({
        callback: function (res) {
          if (res.errorCode === 0) {
            var profile = res.profile || {};

            if (window.EmarsysTrack) {
              window.EmarsysTrack.identify(profile.email, (res.data || {})['ARTS_CUST_KEY']);
            }

            var fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
            var name = fullName || profile.firstName || profile.nickname || 'User';

            var userNameEl = document.querySelector('.fp-user-name');
            if (userNameEl) userNameEl.textContent = name;

            var welcome = document.querySelector('.fp-welcome');
            if (welcome) welcome.style.display = 'inline-flex';

            var account = document.querySelector('.fp-welcome-account');
            if (account) account.style.display = 'inline';

            var separator = document.querySelector('.fp-welcome-separator');
            if (separator) separator.style.display = 'inline';

            var arrow = document.querySelector('.fp-welcome-angle-down');
            if (arrow) arrow.style.display = 'inline-block';

            var notLoggedIn = document.querySelector('.fp-not-logged-in');
            if (notLoggedIn) notLoggedIn.style.display = 'none';
          } else {
            var welcomeOut = document.querySelector('.fp-welcome');
            if (welcomeOut) welcomeOut.style.display = 'none';

            var notLoggedInOut = document.querySelector('.fp-not-logged-in');
            if (notLoggedInOut) notLoggedInOut.style.display = 'inline-block';
          }
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncLoginUI);
  } else {
    syncLoginUI();
  }
})();
