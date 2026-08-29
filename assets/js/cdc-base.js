{
    // Called when an error occurs.
    onError: function(event) {

    },

    // Called before validation of the form.
 
   onBeforeValidation: function (event) {


    },
   

    // Called before a form is submitted. This event gives you an opportunity to perform certain actions before the form is submitted, or cancel the submission by returning false.
    onBeforeSubmit: function(event) {
        if (event.screen === "mpaturu-gigya-register-screen") {
            var rewardsId = event.formData['data.rewardsid'];
            if (!rewardsId) {
                showToast("Rewards ID is blank. Continuing…");
            }
        }
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
