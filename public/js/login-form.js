(function () {
    const form = document.getElementById("login-form");

    if (form) {
        const email = document.getElementById("emailInput");

        email.addEventListener('focusout', (event) => {
            if (email.validity.patternMismatch) {
                email.setCustomValidity("Please enter a valid Stevens email address");
                email.reportValidity();
            } else {
                email.style.background = '';
                email.setCustomValidity("");
            }
        });
    }
})();