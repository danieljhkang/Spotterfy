(function () {
    const form = document.getElementById("register-form");
    if (form) {
        const email = document.getElementById("emailInput");
        const cwid = document.getElementById("cwidInput");

        email.addEventListener('focusout', (event) => {
            if (email.validity.patternMismatch) {
                email.setCustomValidity("Please enter a valid Stevens email address");
                email.reportValidity();
            } else {
                email.style.background = '';
                email.setCustomValidity("");
            }
        });
        cwid.addEventListener("input", (event) => {
            if (cwid.validity.patternMismatch) {
                cwid.setCustomValidity("CWID must only contain digits");
                cwid.reportValidity();
            } else {
                cwid.setCustomValidity("");
            }
        });
    }
})();