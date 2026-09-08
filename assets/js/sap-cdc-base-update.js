
{
  // Called when an error occurs. Profile Update keeps its own onError
  // (handleScreenSetError) set locally in sap-cdc.js, so this stays a no-op
  // to avoid surfacing the same error twice.
  onError: function(event) {
  },

  // Called before validation of the form.
  onBeforeValidation: function(event) {
  },

  // Called after a successful login. Not applicable to the Profile Update
  // screen set.
  onLogin: function (event) {
  },

  // Called when a form is submitted, can return a value or a promise. This event gives you an opportunity to modify the form data when it is submitted.
  onSubmit: function(event) {
  },

  // Called after a form is submitted.
  onAfterSubmit: function(event) {
  },
  onBeforeScreenLoad: function (event) {
    var doc = document;
    doc.getElementById('gigya-textbox-112545187415970690').value = "";
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

          // Replace "username" with a custom label in any inline error below a
          // given field. Works for CDC's field-level validation errors that
          // render in the DOM.
          normalizeFieldErrorLabel: function (fieldName, labelText) {
            var errEl = document.getElementById("gigya-error-msg-gigya-register-form-username");
            if (errEl) {
              errEl.textContent = errEl.textContent.replace(/username/gi, labelText);
            }
          },

          // Show/clear an inline validation message next to a custom field.
          setInlineError: function (inputEl, spanEl, message, code) {
            spanEl.textContent = message || '';
            spanEl.style.display = message ? 'inline' : 'none';
            inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
            inputEl.classList.toggle('gigya-invalid', !!message);
            inputEl.classList.toggle('gigya-valid', !message);
            if (code) inputEl.setAttribute('data-invalid-error-code', String(code));
            else inputEl.removeAttribute('data-invalid-error-code');
          },

          clearInlineError: function (inputEl, spanEl) {
            spanEl.textContent = '';
            spanEl.style.display = 'none';
            inputEl.setAttribute('aria-invalid', 'false');
            inputEl.classList.remove('gigya-invalid');
            inputEl.classList.add('gigya-valid');
            inputEl.removeAttribute('data-invalid-error-code');
          }
        }
      };
    }
  },

  // Called after the Profile Update screen finishes loading: define the
  // shared inline-error helpers and wire up phone-field blur validation.
  onAfterScreenLoad: function (event) {
    var h = document.__cdcNs && document.__cdcNs.helpers;

    // Single source of truth for inline field error messages
    window.setInlineError = h.setInlineError;
    window.clearInlineError = h.clearInlineError;

    // --- Phone field validation on blur ---
    var phoneInput = document.getElementById('gigya-phoneInputLabel-167363755631131230');

    function setFieldError(fieldName, message) {
      if (gigya?.accounts?.setFieldError) {
        gigya.accounts.setFieldError({
          screenSet: "Default-Registration",
          fieldName: fieldName,
          message: message
        });
      } else {
        // Fallback inline message
        var el = phoneInput;
        var id = fieldName.replace(/\W+/g, '_') + '_error';
        var msg = document.getElementById(id);
        if (!msg) {
          msg = document.createElement('div');
          msg.id = id;
          msg.style.color = '#d32f2f';
          msg.style.fontSize = '12px';
          msg.style.marginTop = '4px';
          el.insertAdjacentElement('afterend', msg);
        }
        msg.textContent = message;
      }
    }

    function clearFieldError(fieldName) {
      if (gigya?.accounts?.clearFieldError) {
        gigya.accounts.clearFieldError({
          screenSet: "Default-Registration",
          fieldName: fieldName
        });
      } else if (gigya?.accounts?.setFieldError) {
        gigya.accounts.setFieldError({
          screenSet: "Default-Registration",
          fieldName: fieldName,
          message: ""
        });
      } else {
        var id = fieldName.replace(/\W+/g, '_') + '_error';
        var msg = document.getElementById(id);
        if (msg) msg.remove();
      }
    }

    // Validate on blur
    if (phoneInput !== null) {
      phoneInput.addEventListener('blur', function () {
        var ccInput = document.getElementById('gigya-countryCodeLabel-167363755631131230');
        var isUSA = (ccInput && ccInput.value === '+1');
        var raw = (phoneInput.value || '').trim();

        // Normalize to digits only
        var digits = raw.replace(/\D+/g, '');
        phoneInput.value = digits;

        if (isUSA) {
          // US must be exactly 10 digits
          if (!/^\d{10}$/.test(digits)) {
            setFieldError('profile.phones.number', 'US phone numbers must be exactly 10 digits.');
            return;
          }
        } else {
          // Non-US: digits-only (any length)
          if (!/^\d+$/.test(digits)) {
            setFieldError('profile.phones.number', 'Phone number must contain digits only.');
            return;
          }
        }

        // Clear error if valid
        clearFieldError('profile.phones.number');
        var loginIdEl = document.getElementById('loginID');
        if (loginIdEl) loginIdEl.value = phoneInput.value;
      });
    }

    // Note: lastName is clamped to 1 char in onFieldChanged below (via Gigya's
    // onFieldChanged callback), not with DOM 'input'/'focusout' listeners here —
    // those never fire when a field's value is set programmatically, which is
    // how the iOS app's webview bridge sets it, so the clamp silently never ran there.
  },

  // EDIPI validation stays Registration-only (sap-cdc-base.js), but warn on
  // a blank Rewards ID here too, same as the Registration screen. This
  // Global Config applies to every screen in the mpaturu-ProfileUpdate
  // screen-set (e.g. also mpaturu-gigya-change-email-screen), so only run
  // this check on the actual profile-update screen.
  onBeforeSubmit: function (event) {
    if (event.screen !== 'mpaturu-gigya-update-profile-screen') {
      return true;
    }
    var h = document.__cdcNs && document.__cdcNs.helpers;
    var rewardsId = event.formData['data.rewardsId'];
    if (!rewardsId) {
      h.showToast("Rewards ID is blank. Continuing…");
    }
    return true;
  },

  // Called when a field is changed on the Profile Update screen: phone
  // digit limiting, lastName clamping, and normalizing the inline
  // "username" validation label.
  onFieldChanged: function (event) {
    var h = document.__cdcNs && document.__cdcNs.helpers;

    if (event.field === 'profile.phones.number') {
      var ccInput = document.getElementById('gigya-countryCodeLabel-167363755631131230');
      var phoneInput = document.getElementById('gigya-phoneInputLabel-167363755631131230');
      var isUSA = ccInput && ccInput.value === '+1';
      if (isUSA && phoneInput && phoneInput.value.length > 10) {
        phoneInput.value = phoneInput.value.slice(0, 10);
      }
    }

    if (event.field === 'profile.lastName') {
      var root = document.getElementById(event.containerID) || document.body;
      var lastNameInput = root.querySelector('[name="profile.lastName"]');
      if (lastNameInput && lastNameInput.value.length > 1) {
        lastNameInput.value = lastNameInput.value.slice(0, 1);
      }
    }

    // Your field binding name:
    // If you use username-as-login, CDC usually binds the input to 'loginID' but validationErrors may reference 'username'.
    // Handle both to be safe:
    if (event.field === 'username' || event.field === 'loginID') {
      // Slight delay to let CDC render the error into the DOM first
      setTimeout(function () {
        h.normalizeFieldErrorLabel('username', 'Alternate ID');
      }, 50);
    }
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
