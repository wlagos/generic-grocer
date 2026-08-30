// 1. Explicitly attach the custom method to the global window scope
window.showGigyaToast = function(msg) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.top = '50%';
    toast.style.left = '50%';
    toast.style.transform = 'translate(-50%, -50%)';
    /* Bigger size */
    toast.style.minWidth = '350px';
    toast.style.maxWidth = '500px';
    toast.style.padding = '30px 40px'; 
    toast.style.fontSize = '20px'; 
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
};

// 2. Your Screen-Set Handler Configuration Object
var myScreenSetHandlers = {
    onError: function(event) { },

    // Called before validation of the form.
    onBeforeValidation: function (event) { },

    // Called before a form is submitted.
    onBeforeSubmit: function(event) {
        if (event.screen === "mpaturu-gigya-register-screen") {
            var rewardsId = event.formData['data.rewardsid'];
            if (!rewardsId) {
                // 3. Call the window-scoped version here
                window.showGigyaToast("Rewards ID is blank. Continuing…");
            }
        }
    },

    // Called when a form is submitted
    onAfterSubmit: function(event) {
        console.log("onAfterSubmit event");
    },
    onBeforeScreenLoad: function(event) { },
    onAfterScreenLoad: function(event) { },
    onFieldChanged: function(event) { },
    onHide: function(event) { },
    onButtonClicked: function(event) { }
};
