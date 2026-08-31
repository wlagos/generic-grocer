
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
    console.log("onBeforeScreenLoad begin");
    var doc = document;
    if (!doc.__cdcNs) {
      doc.__cdcNs = {
        helpers: {
          myCustomMethod: function () {
            console.log("myCustomMethod called with:");
            // Your logic here...
          }
        }
      };
    }
    console.log("onBeforeScreenLoad end");
  },
  // Use the helpers in other handlers
  onBeforeSubmit: function (event) {
    console.log("onBeforeSubmit begin");
    var h = document.__cdcNs && document.__cdcNs.helpers;
    if (h) {
      h.myCustomMethod();
    }
    console.log("onBeforeSubmit end");
  },

  // Called when a field is changed in a managed form.
  onFieldChanged: function(event) {
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
