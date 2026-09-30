
async function getJwtToken() {
  return new Promise((resolve, reject) => {
    gigya.accounts.getJWT({
      expiration: 3600,
      callback: function (res) {
        if (res.errorCode === 0 && res.id_token) {
          console.log("JWT Token Retrieved:", res.id_token);
          resolve(res.id_token);
        } else {
          reject(new Error("JWT token not returned: " + JSON.stringify(res)));
        }
      }
    });
  });
}

async function callCustomerProfile(jwtToken, type = "login") {

  const endpoint = type === "registration" ? "registration" : "login";
  const url = `https://deca-dev.apim.fc.scp.sapns2.us:443/v1/customer-profile/${endpoint}`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`
    }
  };
  if (type === "registration") {
    const payload = {
      edipi: "2111704251",
      mobile: "5551234567"
    };
    options.body = JSON.stringify(payload);
  }
  const response = await fetch(url, options);
  const result = await response.json();
  console.log("API Response:", result);
  return result;
}

// Tracks the in-flight promise on window so callers elsewhere (e.g. the
// post-login redirect in sap-cdc.js) can wait for this to actually finish
// instead of racing a navigation against the fetch and losing the result.
// Login fires this from two places (the login screen's onAfterSubmit and
// the global gigya onLogin handler) as a safety net for handler ordering,
// so an in-flight call is reused rather than firing getJWT/login twice.
async function freshShopRegVerification(type = "login") {
  window._freshShopRegPromises = window._freshShopRegPromises || {};
  if (window._freshShopRegPromises[type]) {
    return window._freshShopRegPromises[type];
  }
  window._freshShopRegPromises[type] = (async () => {
    try {
      const jwt = await getJwtToken();
      return await callCustomerProfile(jwt, type);
    } catch (err) {
      console.error("Error:", err);
      return null;
    } finally {
      window._freshShopRegPromises[type] = null;
    }
  })();
  return window._freshShopRegPromises[type];
}
