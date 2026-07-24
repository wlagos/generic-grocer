// Resolve the currently logged-in Gigya user's UID.
function getLoggedInUid() {
  return new Promise((resolve, reject) => {
    gigya.accounts.getAccountInfo({
      callback: function (res) {
        if (res.errorCode === 0 && res.UID) {
          resolve(res.UID);
        } else {
          reject(new Error("No logged-in user found: " + JSON.stringify(res)));
        }
      }
    });
  });
}

async function getJwtToken(uid) {
  const url = "https://accounts.us1.gigya.com/accounts.getJWT";

  if (!uid) {
    throw new Error("getJwtToken: uid is required");
  }

const formData = new URLSearchParams({
  apiKey: "4_eqwSIEzYKaq7MI871n2USw",
  uid: uid,
  secret: "7vDv2Hy2Etrbfs9ctc1dTpTl9AXdtKxXlaHESF7SZJA=", // raw secret
  expiration: "3600"
});

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });

  const data = await response.json();

  if (!data.id_token) {
    throw new Error("JWT token not returned: " + JSON.stringify(data));
  }

  console.log("JWT Token Retrieved:", data.id_token);
  return data.id_token;
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
    const uid = await getLoggedInUid();    // Step 1
    const jwt = await getJwtToken(uid);    // Step 2
    await callCustomerProfile(jwt);        // Step 3
  } catch (err) {
    console.error("Error:", err);
  }
}
