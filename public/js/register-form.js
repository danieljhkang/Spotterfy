(function () {
    const form = document.getElementById("register-form");
    if (form) {
        const cwid = document.getElementById("cwidInput");

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