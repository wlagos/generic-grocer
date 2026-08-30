{
    // Called when an error occurs.
    onError: function(event) {

    },

    showToast: function(msg) {
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

    // Called before validation of the form.
 
   onBeforeValidation: function (event) {


    },
   

    // Called before a form is submitted. This event gives you an opportunity to perform certain actions before the form is submitted, or cancel the submission by returning false.
    onBeforeSubmit: function(event) {
        console.log("onBeforeSubmit begin "+event.screen);
        if (event.screen === "mpaturu-gigya-register-screen") {
            var rewardsId = event.formData['data.rewardsid'];
            if (!rewardsId) {
                this.showToast("Rewards ID is blank. Continuing…");
            }
        }
         console.log("onBeforeSubmit End");
    },

    // Called when a form is submitted, can return a value or a promise. This event gives you an opportunity to modify the form data when it is submitted.
onAfterSubmit: function(event) {
console.log("onAfterSubmit event");

},

    // Called before a new screen is rendered. This event gives you an opportunity to cancel the navigation by returning false.
    onBeforeScreenLoad: function(event) {
    },

    // Called after a new screen is rendered.
    onAfterScreenLoad: function(event) {
    },

    // Called when a field is changed in a managed form.
    onFieldChanged: function(event) {
    },

    // Called when a user clicks the "X" (close) button or the screen is hidden following the end of the flow.
    onHide: function(event) {
    },

    // Called when a user clicks a custom button.
    onButtonClicked: function(event) {
    }
}
