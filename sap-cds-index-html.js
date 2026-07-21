

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
						const name =
							profile.firstName ||
							profile.nickname ||
							profile.email ||
							"User";

						// Update user name
						document.querySelector(".fp-user-name").textContent = name;

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

