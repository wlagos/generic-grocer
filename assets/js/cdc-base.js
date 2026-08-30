// 1. Define your handlers in a named variable
var myScreenSetHandlers = {
    onError: function(event) { },

    showToast: function(msg) {
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

    onBeforeValidation: function (event) { },

    onBeforeSubmit: function(event) {
        if (event.screen === "mpaturu-gigya-register-screen") {
            var rewardsId = event.formData['data.rewardsid'];
            if (!rewardsId) {
                // 2. Call it using the variable name instead of 'this'
                myScreenSetHandlers.showToast("Rewards ID is blank. Continuing…");
            }
        }
    },

    onAfterSubmit: function(event) { console.log("onAfterSubmit event"); },
    onBeforeScreenLoad: function(event) { },
    onAfterScreenLoad: function(event) { },
    onFieldChanged: function(event) { },
    onHide: function(event) { },
    onButtonClicked: function(event) { }
};

// 3. Pass the variable to your Gigya screen-set load command
gigya.accounts.showScreenSet({
    screenSet: 'Your-Screen-Set-ID',
    // ... other parameters ...
    onError: myScreenSetHandlers.onError,
    onBeforeSubmit: myScreenSetHandlers.onBeforeSubmit,
    onAfterSubmit: myScreenSetHandlers.onAfterSubmit,
    onBeforeScreenLoad: myScreenSetHandlers.onBeforeScreenLoad,
    onAfterScreenLoad: myScreenSetHandlers.onAfterScreenLoad,
    onFieldChanged: myScreenSetHandlers.onFieldChanged,
    onHide: myScreenSetHandlers.onHide,
    onButtonClicked: myScreenSetHandlers.onButtonClicked
});
