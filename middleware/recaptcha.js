const reCAPTCHA = require('recaptcha2');

const recaptcha = new reCAPTCHA({
  siteKey: '6LewrL8UAAAAAA2B9jukheZZQ0Seu-_cHsv81diq', // retrieved during setup
  secretKey: '6LewrL8UAAAAAKfcWbRMaWAtbfgu7FyccDwRnTkQ', // retrieved during setup
  ssl: false // optional, defaults to true.
  // Disable if you don't want to access
  // the Google API via a secure connection
});

function submitForm(req, res) {
  recaptcha
    .validateRequest(req)
    .then(function() {
      // validated and secure
      res.json({ formSubmit: true });
    })
    .catch(function(errorCodes) {
      // invalid
      res.json({
        formSubmit: false,
        errors: recaptcha.translateErrors(errorCodes) // translate error codes to human readable text
      });
    });
}

module.exports = recaptcha;
