
{
  // Called when an error occurs. Lite Registration keeps its own onError
  // (handleScreenSetError) set locally in sap-cdc.js, so this stays a no-op
  // to avoid surfacing the same error twice.
  onError: function(event) {
  },

  // Called before validation of the form.
  onBeforeValidation: function(event) {
  },

  // Called after a successful login. Lite Registration keeps its own onLogin
  // set locally in sap-cdc.js, so this stays a no-op.
  onLogin: function (event) {
  },

  // Called when a form is submitted, can return a value or a promise. This event gives you an opportunity to modify the form data when it is submitted.
  onSubmit: function(event) {
  },

  onBeforeScreenLoad: function (event) {
    var doc = document;
    if (!doc.__cdcNs) {
      doc.__cdcNs = {
        helpers: {
          showToast: function (msg) {
            var toast = document.createElement('div');
            toast.textContent = msg;

            toast.style.position = 'fixed';
            toast.style.top = '50%';
            toast.style.left = '50%';
            toast.style.transform = 'translate(-50%, -50%)';

            /* Bigger size */
            toast.style.minWidth = '350px';
            toast.style.maxWidth = '500px';
            toast.style.padding = '30px 40px';   // bigger height + width
            toast.style.fontSize = '20px';       // larger font
            toast.style.lineHeight = '28px';

            /* Style */
            toast.style.background = 'rgba(40, 40, 40, 0.95)';
            toast.style.color = 'white';
            toast.style.textAlign = 'center';
            toast.style.borderRadius = '12px';
            toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.35)';

            /* Animation */
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s ease';

            toast.style.zIndex = '99999';

            document.body.appendChild(toast);

            // Fade in
            setTimeout(() => { toast.style.opacity = '1'; }, 20);

            // Fade out
            setTimeout(() => { toast.style.opacity = '0'; }, 1500);

            // Remove
            setTimeout(() => { toast.remove(); }, 2000);
          },

          // Resolve the site's home URL the same way sap-cdc.js's CDC_HOME_URL
          // does: from wherever sap-cdc.js was actually loaded from, so it
          // works whether the hosting page lives at the site root or one
          // level down (pages/*.html) — without hardcoding a domain/path.
          // This file runs as the screen-set's Global Config (pasted into the
          // Gigya console), a separate scope from sap-cdc.js, so it can't
          // reach that file's local CDC_HOME_URL variable directly.
          getHomeUrl: function () {
            var scriptEl = document.currentScript;
            if (!scriptEl) {
              var scripts = document.getElementsByTagName('script');
              for (var i = scripts.length - 1; i >= 0; i--) {
                if (/assets\/js\/sap-cdc\.js(\?.*)?$/.test(scripts[i].src)) {
                  scriptEl = scripts[i];
                  break;
                }
              }
            }
            if (scriptEl && scriptEl.src) {
              return scriptEl.src.replace(/assets\/js\/sap-cdc\.js(\?.*)?$/, '');
            }
            return './';
          }
        }
      };
    }
  },

  // Called after a screen finishes loading. Lite Registration keeps its own
  // onAfterScreenLoad (handleScreenSetAfterLoad) set locally in sap-cdc.js,
  // so this stays a no-op.
  onAfterScreenLoad: function (event) {
  },

  // Called before a form is submitted. Lite Registration keeps its own
  // onBeforeSubmit set locally in sap-cdc.js (stripping subscriptions.*
  // fields), so this just allows every submission through.
  onBeforeSubmit: function (event) {
    return true;
  },

  // Called when a field is changed in a managed form. Lite Registration
  // keeps its own onFieldChanged (handleScreenSetFieldChanged) set locally
  // in sap-cdc.js, so this stays a no-op.
  onFieldChanged: function (event) {
  },

  // Called after a form is submitted. This Global Config applies to every
  // screen in the mpaturu-LiteRegistration screen-set, so only run this on
  // the "thank you" screen shown after a successful subscribe submission:
  // send the user home.
  onAfterSubmit: function (event) {
    if (event.screen !== 'mpaturu-gigya-subscribe-thank-you-screen') {
      return;
    }
    var h = document.__cdcNs && document.__cdcNs.helpers;
    window.location.href = (h && h.getHomeUrl()) || './';
  },

  // Called when a user clicks the "X" (close) button or the screen is hidden following the end of the flow.
  onHide: function(event) {
  },

  // Called when a user clicks a custom button.
  onButtonClicked: function(event) {
  },

  // Called when a screen is automatically skipped because the "Skip if data exists" option is enabled and the user already has data for all fields on that screen.
  onAutoSkip: function(event) {
  }
}
