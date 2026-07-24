        // Utility: hide caption/title if it matches certain words
        function hideCaptionIfMatches(root, words) {
            const selectors = [
                '#screensetContainer_content_caption',
                '.gigya-header',
                '.gigya-screen-title',
                'h2.gigya-screen-title'
            ];
            const nodes = root.querySelectorAll(selectors.join(','));
            const pattern = new RegExp(words.join('|'), 'i'); // case-insensitive

            nodes.forEach(el => {
                const text = (el.textContent || '').trim();
                if (pattern.test(text)) {
                    el.style.display = 'none';
                    el.style.margin = '0';
                    el.style.padding = '0';
                }
            });
        }
        function showToast(msg) {
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
        }
        /**
 * Replace "username" with your label in any inline error below a given field.
 * Works for CDC’s field-level validation errors that render in the DOM.
 */
        function normalizeFieldErrorLabel(containerID, fieldName, labelText) {
            //const root = document.getElementById(containerID) || document.body;
            document.getElementById("gigya-error-msg-gigya-register-form-username").textContent = document.getElementById("gigya-error-msg-gigya-register-form-username").textContent.replace(/username/gi, labelText);
            // Find the input bound to the field (CDC binds name=data path; login field is often 'loginID')

        }
        function updateRewardsEmailSubscription(optsOrBool, cb) {
            let subsPayload = {};

            if (typeof optsOrBool === 'boolean') {
                // Backward compatible: single boolean → rewards_card only
                subsPayload = {
                    rewards_card: { email: { isSubscribed: optsOrBool } }
                };
            } else if (optsOrBool && typeof optsOrBool === 'object') {
                const opts = optsOrBool;

                // Only include keys that are explicitly boolean to avoid overwriting others
                if (typeof opts.sales_promotions === 'boolean') {
                    subsPayload.sales_promotions = { email: { isSubscribed: opts.sales_promotions } };
                }
                if (typeof opts.healthy_living === 'boolean') {
                    subsPayload.healthy_living = { email: { isSubscribed: opts.healthy_living } };
                }
                if (typeof opts.food_safety === 'boolean') {
                    subsPayload.food_safety = { email: { isSubscribed: opts.food_safety } };
                }
                if (typeof opts.rewards_card === 'boolean') {
                    subsPayload.rewards_card = { email: { isSubscribed: opts.rewards_card } };
                }
            } else {
                // Nothing valid provided
                if (typeof cb === 'function') {
                    cb({ errorCode: 0, status: 'noop', message: 'No subscription flags provided.' });
                }
                return;
            }

            // If the payload is empty (object mode with no boolean keys), short‑circuit
            if (Object.keys(subsPayload).length === 0) {
                if (typeof cb === 'function') {
                    cb({ errorCode: 0, status: 'noop', message: 'No subscription flags provided.' });
                }
                return;
            }

            gigya.accounts.setAccountInfo({
                subscriptions: subsPayload,
                callback: function (res) {
                    if (typeof cb === 'function') cb(res);
                }
            });
        }
        // Shared field-change handler for all screensets (phone digit limiting,
        // and normalizing the inline "username" validation label)
        function handleScreenSetFieldChanged(e) {
            if (e.field === "profile.phones.number") {
                var ccDigits = document.getElementById('gigya-countryCodeLabel-167363755631131230').value; // "+1" for US
                var isUSA = (ccDigits === '+1');
                var phoneInputValue = document.getElementById('gigya-phoneInputLabel-167363755631131230').value;
                if (isUSA && phoneInputValue.length > 10) {
                    document.getElementById('gigya-phoneInputLabel-167363755631131230').value = phoneInputValue.slice(0, 10);
                }
            }
            const ALT_ID = 'Alternate ID';

            // Your field binding name:
            // If you use username-as-login, CDC usually binds the input to 'loginID' but validationErrors may reference 'username'.
            // Handle both to be safe:
            if (e.field === 'username' || e.field === 'loginID') {
                // Slight delay to let CDC render the error into the DOM first
                setTimeout(() => {
                    normalizeFieldErrorLabel(e.containerID, 'username', ALT_ID);
                    //normalizeFieldErrorLabel(e.containerID, 'loginID', ALT_ID);
                }, 50);
            }
        }

        // Normalize the inline "username" validation error on a failed submit.
        // Shared across Login, Registration, and Lite Registration.
        function normalizeFailedSubmitFieldError(e) {
            const failed = e && e.response && e.response.errorCode !== 0;
            if (failed) {
                const ALT_ID = 'Alternate ID';

                // Normalize inline field error for both possible bindings
                setTimeout(() => {
                    normalizeFieldErrorLabel(e.containerID, 'username', ALT_ID);
                    // normalizeFieldErrorLabel(e.containerID, 'loginID', ALT_ID);
                }, 50);
            }
        }

        // Shared after-screen-load handler for all screensets: define inline-error
        // helpers, hide screen captions, and wire phone/lastName field feedback.
        function handleScreenSetAfterLoad(event) {
                    // const screensWithLoginID = ['mpaturu-gigya-register-screen', 'mpaturu-gigya-login-screen'];
                    // if (!screensWithLoginID.includes(event.currentScreen)) return;
                    const root = document.getElementById(event.containerID) || document.body;

                    // Hide captions based on current screen
                    if (event.currentScreen === 'mpaturu-gigya-login-screen') {
                        hideCaptionIfMatches(root, ['login']);
                    } if (event.currentScreen === 'mpaturu-gigya-register-screen') {
                        hideCaptionIfMatches(root, ['register', 'registration']);
                    }
                    if (event.currentScreen === 'mpaturu-gigya-subscribe-with-email-screen') {
                        hideCaptionIfMatches(root, ['lite', 'Subscribe with email']);
                    }

                    // Re-apply hiding if CDC re-renders parts of the DOM
                    const mo = new MutationObserver(() => {
                        if (event.currentScreen === 'mpaturu-gigya-login-screen') {
                            hideCaptionIfMatches(root, ['login']);
                        }
                        if (event.currentScreen === 'mpaturu-gigya-register-screen') {
                            hideCaptionIfMatches(root, ['register', 'registration']);
                        }
                        if (event.currentScreen === 'mpaturu-gigya-subscribe-with-email-screen') {
                            hideCaptionIfMatches(root, ['lite', 'Subscribe with email']);
                        }

                    });
                    mo.observe(root, { childList: true, subtree: true });
                    // Single source of truth for messages


                    window.setInlineError = function (inputEl, spanEl, message, code) {
                        spanEl.textContent = message || '';
                        spanEl.style.display = message ? 'inline' : 'none';
                        inputEl.setAttribute('aria-invalid', message ? 'true' : 'false');
                        inputEl.classList.toggle('gigya-invalid', !!message);
                        inputEl.classList.toggle('gigya-valid', !message);
                        if (code) inputEl.setAttribute('data-invalid-error-code', String(code));
                        else inputEl.removeAttribute('data-invalid-error-code');
                    };

                    window.clearInlineError = function (inputEl, spanEl) {
                        spanEl.textContent = '';
                        spanEl.style.display = 'none';
                        inputEl.setAttribute('aria-invalid', 'false');
                        inputEl.classList.remove('gigya-invalid');
                        inputEl.classList.add('gigya-valid');
                        inputEl.removeAttribute('data-invalid-error-code');
                    };
                    // --- Phone field validation on blur ---
                    // country code control
                    var phoneInput = document.getElementById('gigya-phoneInputLabel-167363755631131230'); // phone input


                    // Helpers to show/clear errors using Gigya API if available
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

                            var ccDigits = document.getElementById('gigya-countryCodeLabel-167363755631131230').value; // "+1" for US
                            var isUSA = (ccDigits === '+1');
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
                            document.getElementById('loginID').value = document.getElementById('gigya-phoneInputLabel-167363755631131230').value;
                        });
                    }
                    // Optional: live filtering to keep digits only
                    // --- Keep your existing lastName clamp, observers, etc. below ---
                    //const root = document.getElementById(event.containerID) || document.body;
                    const container = document.getElementById('screensetContainer');
                    if (!container) return;

                    function clampToOneChar(val) { return (val || '').slice(0, 1); }
                    function onFocusOut(evt) {
                        var target = evt.target;
                        if (target && target.name === 'profile.lastName') {
                            target.value = clampToOneChar(target.value);
                        }
                    }
                    container.addEventListener('focusout', onFocusOut, true);
                    container.addEventListener('input', function (evt) {
                        var target = evt.target;
                        if (target && target.name === 'profile.lastName') {
                            target.value = clampToOneChar(target.value);
                        }
                    }, true);
                    // const mo = new MutationObserver(() => { /* your caption hide logic */ });
                    //  mo.observe(root, { childList: true, subtree: true });
                }

        // Render the Login screen
        function renderLoginScreen() {
            gigya.accounts.showScreenSet({
                screenSet: 'mpaturu-RegistrationLogin',
                startScreen: 'mpaturu-gigya-login-screen',
                containerID: 'screensetContainer',
                onLogin: function (eventObj) {
                    console.log("Authentication successful user details:");
                },
                onBeforeSubmit: function (e) {
                    return true;
                },
                onError: function (event) {
                    console.log("phone error");
                },
                onAfterSubmit: function (e) {
                    if (e.screen === 'mpaturu-gigya-login-screen' && e.response.status === 'OK') {
                        setTimeout(() => {
                            window.location.href = "../";
                        }, 100);
                        return;
                    }
                    normalizeFailedSubmitFieldError(e);
                },
                onFieldChanged: handleScreenSetFieldChanged,
                onAfterScreenLoad: handleScreenSetAfterLoad
            });
        }

        // Render the Registration screen
        function renderRegistrationScreen() {
            gigya.accounts.showScreenSet({
                screenSet: 'mpaturu-RegistrationLogin',
                startScreen: 'mpaturu-gigya-register-screen',
                containerID: 'screensetContainer',
                onLogin: function (eventObj) {
                    console.log("Authentication successful user details:");
                },
                onBeforeSubmit: function (e) {
                    var rewardsId = e.formData['data.rewardsid'];
                    if (!rewardsId) {
                        showToast("Rewards ID is blank. Continuing…");
                    }
                    return true;
                },
                onError: function (event) {
                    console.log("phone error");
                },
                onAfterSubmit: function (e) {
                    if (e.screen === 'mpaturu-gigya-register-screen' && e.response.errorCode === 206002) {
                        showToast("Your profile has been successfully created.");
                        freshShopRegVerification(e.response.UID);
                        gigya.accounts.showScreenSet({
                            screenSet: 'mpaturu-RegistrationLogin',
                            startScreen: 'mpaturu-gigya-login-screen',
                            containerID: 'screensetContainer'
                        });
                        return;
                    }
                    normalizeFailedSubmitFieldError(e);
                },
                onFieldChanged: handleScreenSetFieldChanged,
                onAfterScreenLoad: handleScreenSetAfterLoad
            });
        }

        // Render the Lite Registration ("Subscribe with email") screen
        function renderLiteRegistrationScreen() {
            gigya.accounts.showScreenSet({
                screenSet: 'mpaturu-LiteRegistration',
                startScreen: 'mpaturu-gigya-subscribe-with-email-screen',
                containerID: 'screensetContainer',
                onLogin: function (eventObj) {
                    console.log("Authentication successful user details:");
                },
                onBeforeSubmit: function (e) {
                    // Lite does NOT submit subscriptions.* as a form field.
                    // This prevents error 400024 (dynamic fields not allowed)
                    delete e.formData['subscriptions.rewards_card.email.isSubscribed'];
                    delete e.formData['subscriptions.food_safety.email.isSubscribed'];
                    delete e.formData['subscriptions.healthy_living.email.isSubscribed'];
                    delete e.formData['subscriptions.sales_promotions.email.isSubscribed'];
                    return true;
                },
                onError: function (event) {
                    console.log("phone error");
                },
                onAfterSubmit: function (e) {
                    if (e && e.response && e.response.errorCode === 0) {
                        // Default behavior for the "Subscribe with email" screen:
                        // subscribe the user to rewards_card email
                        updateRewardsEmailSubscription(true, function (upd) {
                            if (upd.errorCode === 0) {
                                showToast('Subscribed to Rewards Card emails.');
                            } else {
                                console.warn('Subscription update failed:', upd);
                                showToast('Could not update subscription. Please try later.');
                            }
                        });
                    }
                    normalizeFailedSubmitFieldError(e);
                },
                onFieldChanged: handleScreenSetFieldChanged,
                onAfterScreenLoad: handleScreenSetAfterLoad
            });
        }

        // Render the Profile Update screen
        function renderProfileUpdateScreen() {
            gigya.accounts.showScreenSet({
                screenSet: 'mpaturu-ProfileUpdate',
                startScreen: 'mpaturu-gigya-update-profile-screen',
                containerID: 'screensetContainer',
                onError: function (event) {
                    console.log("phone error");
                },
                onAfterSubmit: function (e) {
                    if (e.screen === 'mpaturu-gigya-update-profile-screen' && e.response.status === 'OK') {
                        setTimeout(() => {
                            window.location.href = "../";
                        }, 100);
                        return;
                    }
                    normalizeFailedSubmitFieldError(e);
                },
                onFieldChanged: handleScreenSetFieldChanged,
                onAfterScreenLoad: handleScreenSetAfterLoad
            });
        }

        // Dispatch to the right screen renderer based on the URL hash
        function renderAuthScreen() {
            const hash = (window.location.hash || '').toLowerCase();
            if (['#register', '#signup', '#create', '#create-account'].includes(hash)) {
                renderRegistrationScreen();
            } else if (hash === '#lite') {
                renderLiteRegistrationScreen();
            } else {
                // Default (My Account) destination: show the profile update
                // screen for an already-authenticated user, otherwise fall
                // back to the login screen.
                gigya.accounts.getAccountInfo({
                    callback: function (res) {
                        if (res.errorCode === 0) {
                            renderProfileUpdateScreen();
                        } else {
                            renderLoginScreen();
                        }
                    }
                });
            }
        }

        // Expose separate methods for external use: Login, Registration, Lite Registration
        // Accessible as `window.sapCds.showLogin()`, `window.sapCds.showRegistration()`, etc.
        window.sapCds = window.sapCds || {};
        window.sapCds.showLogin = function () { return renderLoginScreen(); };
        window.sapCds.showRegistration = function () { return renderRegistrationScreen(); };
        window.sapCds.showLiteRegistration = function () { return renderLiteRegistrationScreen(); };
        window.sapCds.showProfileUpdate = function () { return renderProfileUpdateScreen(); };
        // Additional helpers
        window.sapCds.renderAuthScreen = renderAuthScreen;
        window.sapCds.setLoggedInUI = setLoggedInUI;
        window.sapCds.setLoggedOutUI = setLoggedOutUI;
        function setLoggedInUI(account) {
            // Hide the auth links
            const notLoggedIn = document.querySelector(".fp-not-logged-in");
            if (notLoggedIn) notLoggedIn.style.display = "none";

/*             document.getElementById("nav-login").style.display = "none";
            document.getElementById("nav-register").style.display = "none";

            // Show the authenticated links
            document.getElementById("nav-myaccount").style.display = "";
            document.getElementById("nav-logout").style.display = "";

            // Show welcome strip with the user's first name (or email fallback)
            var name = (account.profile && account.profile.firstName)
                ? account.profile.firstName
                : (account.profile && account.profile.email)
                    ? account.profile.email
                    : "User";

            document.getElementById("welcome-name").textContent = name;

            var strip = document.getElementById("welcome-strip");
            strip.style.display = "flex";

            // Clear any screenset still rendered in the container
            document.getElementById(CDC_CONFIG.containerId).innerHTML = ""; */
        }

        /**
         * Switch the header nav into the LOGGED-OUT state.
         * Restores Login/Register; hides My Account/Logout.
         */
        function setLoggedOutUI() {

/*             document.getElementById("nav-login").style.display = "";
            document.getElementById("nav-register").style.display = "";

            document.getElementById("nav-myaccount").style.display = "none";
            document.getElementById("nav-logout").style.display = "none";

            document.getElementById("welcome-strip").style.display = "none";

            // Clear the screenset container
            document.getElementById(CDC_CONFIG.containerId).innerHTML = ""; */
        }

        // Bootstrap with hashchange (debounced to avoid double render)
        // NOTE: the CDC Web SDK calls this global function automatically once
        // it has finished initializing — it must be a plain global function
        // named exactly onGigyaServiceReady, not a property on another object.
        function onGigyaServiceReady() {
            renderAuthScreen();

            window.addEventListener('hashchange', (() => {
                let timer;
                return function () {
                    clearTimeout(timer);
                    timer = setTimeout(() => renderAuthScreen(), 50);
                };
            })());


            // Session events: as a fallback, update subscription right after login if Lite was used
            gigya.accounts.addEventHandlers({
                onLogin: function (event) {
                    console.log("[CDC] Global onLogin — UID:", event.UID);
                    const sHash = (window.location.hash || '').toLowerCase();
                    if (sHash === '#lite') {
                        // In case onAfterSubmit didn't fire (some flows), ensure subscription is set
                        updateRewardsEmailSubscription(true);
                    }

                   setLoggedInUI(event);
                },
                onLogout: function (event) { /* optional */
                    // Fired after any logout, including session expiry.
                    console.log("[CDC] Global onLogout.");
                 //   setLoggedOutUI();
                }
            });

            gigya.accounts.session.verify({
                callback: function (response) {
                    // optional: nothing to change here for validation
                }
            });
        }

        document.addEventListener("DOMContentLoaded", function () {

            gigya.accounts.getAccountInfo({
                callback: function (res) {

                    if (res.errorCode === 0) {
                        // Logged in

                        const cdcUID = res.UID;
                        // or response.data.customerId or any external_id you choose

                        ScarabQueue.push(['setCustomerId', cdcUID]);
                        ScarabQueue.push(['go']);  // send immediately

                        const profile = res.profile || {};
                        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
                        const name =
                            fullName ||
                            profile.firstName ||
                            profile.nickname ||
                            "User";

                        // Update user name
                        const userNameEl = document.querySelector(".fp-user-name");
                        if (userNameEl) userNameEl.textContent = name;

                        // Reveal ALL welcome elements
                        const welcome = document.querySelector(".fp-welcome");
                        if (welcome) welcome.style.display = "inline-flex";

                        const account = document.querySelector(".fp-welcome-account");
                        if (account) account.style.display = "inline";

                        const separator = document.querySelector(".fp-welcome-separator");
                        if (separator) separator.style.display = "inline";

                        const arrow = document.querySelector(".fp-welcome-angle-down");
                        if (arrow) arrow.style.display = "inline-block";

                        // Hide login/create block
                        const notLoggedIn = document.querySelector(".fp-not-logged-in");
                        if (notLoggedIn) notLoggedIn.style.display = "none";


                    } else {
                        // Logged out
                        const welcome = document.querySelector(".fp-welcome");
                        if (welcome) welcome.style.display = "none";

                        const notLoggedIn = document.querySelector(".fp-not-logged-in");
                        if (notLoggedIn) notLoggedIn.style.display = "inline-block";
                    }
                }
            });
            const trigger = document.querySelector('.fp-your-account');
            const arrow = document.querySelector('.fp-welcome-angle-down');
            const menu = document.querySelector('.fp-user-session-menu');

            if (trigger && menu) {

                // CLICK ON ARROW → TOGGLE DROPDOWN (NO NAVIGATION)
                if (arrow) {
                    arrow.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        const isOpen = menu.style.display === "block";
                        menu.style.display = isOpen ? "none" : "block";
                    });
                }

                // CLICK ON "My Account" TEXT LINK → NORMAL NAVIGATION
                // (do not override link behavior)

                // CLICK ON WRAPPER (div) → TOGGLE DROPDOWN, DO NOT NAVIGATE
                trigger.addEventListener('click', function (e) {
                    // block only when clicking the wrapper, not the link
                    if (!e.target.classList.contains('fp-your-account-link')) {
                        e.preventDefault();
                        e.stopPropagation();

                        const isOpen = menu.style.display === "block";
                        menu.style.display = isOpen ? "none" : "block";
                    }
                });

                // CLICK OUTSIDE → CLOSE DROPDOWN
                document.addEventListener('click', function (e) {
                    if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                        menu.style.display = "none";
                    }
                });

            }
        });
