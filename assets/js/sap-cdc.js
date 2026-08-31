
{
  // Called when an error occurs.
  onError: function(event) {
  },

  // Called before validation of the form.
  onBeforeValidation: function(event) {
  },



  // Called when a form is submitted, can return a value or a promise. This event gives you an opportunity to modify the form data when it is submitted.
  onSubmit: function(event) {
  },

  // Called after a form is submitted.
  onAfterSubmit: function(event) {
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

          // Replace "username" with a custom label in any inline error below a
          // given field. Works for CDC's field-level validation errors that
          // render in the DOM.
          normalizeFieldErrorLabel: function (containerID, fieldName, labelText) {
            console.log("normalizeFieldErrorLabel called with:", { containerID: containerID, fieldName: fieldName, labelText: labelText });
            var errEl = document.getElementById("gigya-error-msg-gigya-register-form-username");
            console.log("normalizeFieldErrorLabel errEl found:", !!errEl, errEl ? errEl.textContent : null);
            if (errEl) {
              var before = errEl.textContent;
              errEl.textContent = errEl.textContent.replace(/username/gi, labelText);
              console.log("normalizeFieldErrorLabel replaced text:", { before: before, after: errEl.textContent });
            }
          },

          /* EDIPI validation temporarily disabled — commented out, not deleted.
          // Fetch an OAuth access token for the validate-edipi API via the
          // client_credentials token endpoint (Basic auth with client id/secret).
          getEdipiAccessToken: async function () {
            const tokenUrl = "https://deca-dev.apim.fc.scp.sapns2.us:443/v1/customer-profile/validate-edipi/token";
            const clientId = "6sr10dNf0N11HBapfXAUDRAcAtzA6P12";
            const clientSecret = "wHRsalGMvQJISkeI";
            const basicAuth = btoa(`${clientId}:${clientSecret}`);

            const response = await fetch(tokenUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${basicAuth}`
              },
              body: "grant_type=client_credentials"
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result || !result.access_token) {
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

            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
              },
              body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => null);
            console.log("EDIPI validation response:", response.status, result);
            const isValid = response.ok && !!result && result.result === "continue_registration";
            return { ok: isValid, status: response.status, result: result };
          }
          */
        }
      };
    }
  },
  // Use the helpers in other handlers
  onBeforeSubmit: function (event) {
    // This Global Config applies to every screen in the screen-set, so only
    // run the Registration-screen EDIPI/rewards-ID logic on that screen.
   
    if (event.screen !== 'mpaturu-gigya-register-screen') {
      return true;
    }
    var h = document.__cdcNs && document.__cdcNs.helpers;
    var rewardsId = event.formData['data.rewardsId'];
    if (!rewardsId) {
    console.log("Rewards ID is blank");
      h.showToast("Rewards ID is blank. Continuing…");
    }
  //  var militaryId = event.formData['data.militaryId'];

    // onBeforeSubmit is synchronous and can't await the EDIPI validation
    // call. So: cancel this submit attempt, run the async validation, and
    // on success re-trigger the submit button — skipping validation the
    // second time around via the _edipiValidated flag.
   // if (window._edipiValidated) {
   //   window._edipiValidated = false;
   //   return true;
   // }
   // if (!militaryId) {
    //  return true;
   // }

    /* EDIPI validation call temporarily disabled — commented out, not deleted.
    h.validateEdipi(militaryId).then(function (res) {
      if (res.ok) {
        window._edipiValidated = true;
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
      console.error("EDIPI validation error:", err);
      h.showToast("Could not validate Military ID right now. Please try again.");
    });

    return false;
    */

    return true;
  },

  // Called when a field is changed in a managed form.
  // This Global Config applies to every screen in the screen-set, so only
  // run the Registration-screen field handling (phone digit limiting,
  // normalizing the inline "username" validation label) here.
  onFieldChanged: function (event) {
    console.log("onFieldChanged fired:", { screen: event.screen, field: event.field, containerID: event.containerID });
    if (event.screen !== 'mpaturu-gigya-register-screen') {
      console.log("onFieldChanged skipped, wrong screen:", event.screen);
      return;
    }
    var h = document.__cdcNs && document.__cdcNs.helpers;
    console.log("onFieldChanged helpers available:", !!h);

    if (event.field === 'profile.phones.number') {
      var ccInput = document.getElementById('gigya-countryCodeLabel-167363755631131230');
      var phoneInput = document.getElementById('gigya-phoneInputLabel-167363755631131230');
      var isUSA = ccInput && ccInput.value === '+1';
      console.log("onFieldChanged phone check:", { isUSA: isUSA, phoneValue: phoneInput && phoneInput.value });
      if (isUSA && phoneInput && phoneInput.value.length > 10) {
        phoneInput.value = phoneInput.value.slice(0, 10);
        console.log("onFieldChanged phone truncated to:", phoneInput.value);
      }
    }

    // Your field binding name:
    // If you use username-as-login, CDC usually binds the input to 'loginID' but validationErrors may reference 'username'.
    // Handle both to be safe:
    if (event.field === 'username' || event.field === 'loginID') {
      var containerID = event.containerID;
      console.log("onFieldChanged scheduling normalizeFieldErrorLabel for containerID:", containerID);
      // Slight delay to let CDC render the error into the DOM first
      setTimeout(function () {
        h.normalizeFieldErrorLabel(containerID, 'username', 'Alternate ID');
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
