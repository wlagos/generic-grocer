
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

//
// STEP 2 — Use returned token to call the SAP API
//
async function callCustomerProfile(jwtToken) {
  const url = "https://dev.apim.fc.scp.sapns2.us/v1/customer-profile";

  const payload = {
    EDIPI: "1234567890",
    Mobile: "5551234567"
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwtToken}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  console.log("API Response:", result);
  return result;
}

//
// STEP 3 — Run both steps
//
async function freshShopRegVerification() {
  try {
    const jwt = await getJwtToken();       // Step 2
    await callCustomerProfile(jwt);        // Step 3
  } catch (err) {
    console.error("Error:", err);
  }
}
