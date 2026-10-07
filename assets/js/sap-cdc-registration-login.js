
{
  // Called when an error occurs. This Global Config applies to every screen
  // in the screen-set, so only run the Registration- and Login-screen error
  // surfacing here (Lite Registration and Profile Update still get their own
  // onError in sap-cdc.js).
  onError: function(event) {
    if (event.screen !== 'mpaturu-gigya-register-screen' && event.screen !== 'mpaturu-gigya-login-screen') {
      return;
    }
    var h = document.__cdcNs && document.__cdcNs.helpers;
    console.error('Screen-set error:', event);
    var message = (event && (event.errorMessage || event.errorDetails)) ||
      'Something went wrong. Please try again.';
    if (h) h.showToast(message);
  },

  // Called before validation of the form. Unused.
  onBeforeValidation: function(event) {
  },

  // Called after a successful login. This Global Config applies to every
  // screen in the screen-set, so only run the Registration- and Login-screen
  // logging here (Lite Registration still gets its own onLogin in sap-cdc.js).
  onLogin: function (event) {
    if (event.screen !== 'mpaturu-gigya-register-screen' && event.screen !== 'mpaturu-gigya-login-screen') {
      return;
    }
    console.log("Authentication successful user details:");
  },



  // On the EDIPI-validated resubmit (see onBeforeSubmit), overwrite the real
  // militaryId with a placeholder so the validated ID itself isn't stored.
  // Also copies Login ID into profile.email on the register screen: CDC's
  // verification policy reads from profile.email, not Login ID, and the
  // registration screen's "Email" field is bound to Login ID — so without
  // this, the account always comes back missing profile.email even though
  // the user already typed an email. Duplicated here (not just in the local
  // onSubmit passed to showScreenSet in sap-cdc.js) in case this Global
  // Config's onSubmit is what actually runs instead.
  onSubmit: function(event) {
    if (event.screen !== 'mpaturu-gigya-register-screen') {
      return;
    }
    if (event.formModel.data.loginID && !event.formModel.data['profile.email']) {
      event.formModel.data['profile.email'] = event.formModel.data.loginID;
    }
    if (window._pendingMilitaryIdZero) {
      window._pendingMilitaryIdZero = false;
      event.formModel.data.militaryId = "0000000000";
    }
  },

  // Called after a form is submitted. Unused.
  onAfterSubmit: function(event) {
  },

  // Defines document.__cdcNs.helpers (shared toast/error/EDIPI helpers used
  // by the other handlers below) once, the first time any screen loads.
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

            toast.style.minWidth = '350px';
            toast.style.maxWidth = '500px';
            toast.style.padding = '30px 40px';
            toast.style.fontSize = '20px';
            toast.style.lineHeight = '28px';

            toast.style.background = 'rgba(40, 40, 40, 0.95)';
            toast.style.color = 'white';
            toast.style.textAlign = 'center';
            toast.style.borderRadius = '12px';
            toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.35)';

            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.4s ease';

            toast.style.zIndex = '99999';

            document.body.appendChild(toast);

            setTimeout(() => { toast.style.opacity = '1'; }, 20);
            setTimeout(() => { toast.style.opacity = '0'; }, 1500);
            setTimeout(() => { toast.remove(); }, 2000);
          },

          // Replace "username" with a custom label in any inline error below a
          // given field. Works for CDC's field-level validation errors that
          // render in the DOM.
          normalizeFieldErrorLabel: function (fieldName, labelText) {
            var errEl = document.getElementById("gigya-error-msg-gigya-register-form-username");
            if (errEl) {
              var before = errEl.textContent;
              errEl.textContent = errEl.textContent.replace(/username/gi, labelText);
            }
          },

          // Hide caption/title elements under root whose text matches any of the
          // given words (case-insensitive). Used to hide the per-screen heading
          // CDC renders (e.g. "Login", "Register") when a custom title is used.
          hideCaptionIfMatches: function (root, words) {
            var selectors = [
              '#screensetContainer_content_caption',
              '.gigya-header',
              '.gigya-screen-title',
              'h2.gigya-screen-title'
            ];
            var nodes = root.querySelectorAll(selectors.join(','));
            var pattern = new RegExp(words.join('|'), 'i');

            nodes.forEach(function (el) {
              var text = (el.textContent || '').trim();
              if (pattern.test(text)) {
                el.style.display = 'none';
                el.style.margin = '0';
                el.style.padding = '0';
              }
            });
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
          },

          // Fetch an OAuth access token for the validate-edipi API via the
          // client_credentials token endpoint (Basic auth with client id/secret).
          getEdipiAccessToken: async function () {
            const tokenUrl = "https://deca-dev.apim.fc.scp.sapns2.us:443/v1/customer-profile/validate-edipi/token";
            const clientId = "6sr10dNf0N11HBapfXAUDRAcAtzA6P12";
            const clientSecret = "wHRsalGMvQJISkeI";
            const basicAuth = btoa(`${clientId}:${clientSecret}`);

            let response;
            try {
              response = await fetch(tokenUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  "Authorization": `Basic ${basicAuth}`
                },
                body: "grant_type=client_credentials"
              });
            } catch (fetchErr) {
              console.error('[getEdipiAccessToken] fetch threw (network/CORS error):', fetchErr && fetchErr.name, fetchErr && fetchErr.message, fetchErr);
              throw fetchErr;
            }

            const result = await response.json().catch(function (parseErr) {
              console.error('[getEdipiAccessToken] failed to parse token response JSON:', parseErr);
              return null;
            });

            if (!response.ok || !result || !result.access_token) {
              console.error('[getEdipiAccessToken] token request failed. status =', response.status, 'body =', result);
              throw new Error("EDIPI token request failed: " + response.status);
            }
            return result.access_token;
          },

          // Validate a Military ID (EDIPI) against the SAP customer-profile API.
          // First fetches an access token from the validate-edipi/token endpoint,
          // then uses it as the Bearer token for the validate-edipi call.
          validateEdipi: async function (militaryId) {
            const url = "https://deca-dev.apim.fc.scp.sapns2.us:443/v1/customer-profile/validate-edipi";
            const payload = {
              edipi: militaryId
            };

            const accessToken = await this.getEdipiAccessToken();

            let response;
            try {
              response = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
              });
            } catch (fetchErr) {
              console.error('[validateEdipi] fetch threw (network/CORS error):', fetchErr && fetchErr.name, fetchErr && fetchErr.message, fetchErr);
              throw fetchErr;
            }

            const result = await response.json().catch(function (parseErr) {
              console.error('[validateEdipi] failed to parse validate-edipi response JSON:', parseErr);
              return null;
            });
            console.log("[validateEdipi] response body:", response.status, result);
            const isValid = response.ok && !!result && result.result === "continue_registration";
            return { ok: isValid, status: response.status, result: result };
          }
        }
      };
    }
  },
  // Called after a screen finishes loading. This Global Config applies to
  // every screen in the screen-set: hide the per-screen caption/title,
  // define the shared inline-error helpers, and wire up phone/lastName
  // field feedback that all screens rely on.
  onAfterScreenLoad: function (event) {
    var h = document.__cdcNs && document.__cdcNs.helpers;
    var root = document.getElementById(event.containerID) || document.body;

    function applyCaptionHiding() {
      if (event.currentScreen === 'mpaturu-gigya-login-screen') {
        h.hideCaptionIfMatches(root, ['login']);
      }
      if (event.currentScreen === 'mpaturu-gigya-register-screen') {
        h.hideCaptionIfMatches(root, ['register', 'registration']);
      }
      if (event.currentScreen === 'mpaturu-gigya-subscribe-with-email-screen') {
        h.hideCaptionIfMatches(root, ['lite', 'Subscribe with email']);
      }
    }
    applyCaptionHiding();

    // Re-apply hiding if CDC re-renders parts of the DOM
    var mo = new MutationObserver(applyCaptionHiding);
    mo.observe(root, { childList: true, subtree: true });

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

  // Gates registration submit on Military ID (EDIPI) validation. This Global
  // Config applies to every screen in the screen-set, so only run the
  // Registration-screen EDIPI/rewards-ID logic on that screen.
  onBeforeSubmit: function (event) {
    if (event.screen !== 'mpaturu-gigya-register-screen') {
      return true;
    }
    var h = document.__cdcNs && document.__cdcNs.helpers;
    if (!h) {
      return true;
    }
    var militaryId = event.formData['data.militaryId'];

    // onBeforeSubmit is synchronous and can't await the EDIPI validation
    // call. So: cancel this submit attempt, run the async validation, and
    // on success re-trigger the submit button — skipping validation (and
    // the rewards-ID check below, so its toast isn't shown twice) the
    // second time around via the _edipiValidated flag.
    if (window._edipiValidated) {
      window._edipiValidated = false;
      return true;
    }

    var rewardsId = event.formData['data.rewardsId'];
    if (!rewardsId) {
      h.showToast("Rewards ID is blank. Continuing…");
    }
    if (!militaryId) {
      return true;
    }

    h.validateEdipi(militaryId).then(function (res) {
      if (res.ok) {
        window._edipiValidated = true;
        // The actual militaryId is not stored on success; onSubmit sets the
        // field to a fixed placeholder value once this resubmit goes through.
        // The resubmit re-reads formData from the DOM, so the real field
        // (bound via name="data.militaryId") must be updated, not event.formData.
        window._pendingMilitaryIdZero = true;
        var submitBtn = document.querySelector(
          '#gigya-register-form input[type="submit"], #gigya-register-form button[type="submit"], #gigya-register-form .gigya-input-submit'
        );
        if (submitBtn) {
          submitBtn.click();
        }
      } else {
        h.showToast("Military ID could not be validated. Please check and try again.");
      }
    }).catch(function (err) {
      console.error("[onBeforeSubmit] EDIPI validation error:", err && err.name, err && err.message, err);
      h.showToast("Could not validate Military ID right now. Please try again.");
    });

    return false;
  },

  // Called when a field is changed in a managed form.
  // This Global Config applies to every screen in the screen-set, so only
  // run the Registration- and Login-screen field handling (phone digit
  // limiting, lastName clamping, normalizing the inline "username"
  // validation label) here. Lite Registration and Profile Update have
  // their own Global Config / local onFieldChanged elsewhere.
  onFieldChanged: function (event) {
    if (event.screen !== 'mpaturu-gigya-register-screen' && event.screen !== 'mpaturu-gigya-login-screen') {
      return;
    }
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

      var lastNameInput = document.getElementById('gigya-textbox-lastName');
      if (lastNameInput && lastNameInput.value.length > 1) {
        lastNameInput.value = lastNameInput.value.slice(0, 1);
      }
    }

    // CDC binds this input to 'loginID', but its validation error references
    // 'username' — handle both field names to catch it either way.
    if (event.field === 'username' || event.field === 'loginID') {
      // Slight delay to let CDC render the error into the DOM first
      setTimeout(function () {
        h.normalizeFieldErrorLabel('username', 'Alternate ID');
      }, 50);
    }
  },

  // Called when the "X" (close) button is clicked or the screen is hidden
  // after the flow ends. Unused.
  onHide: function(event) {
  },

  // Called when a custom button is clicked. Unused.
  onButtonClicked: function(event) {
  },

  // Called when a screen is auto-skipped ("Skip if data exists" already
  // satisfied). Unused.
  onAutoSkip: function(event) {
  }
}
