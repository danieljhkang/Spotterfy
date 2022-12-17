(function () {
    const form = document.getElementById("register-form");
    if (form) {
        console.log("The form is here");
        const cwid = document.getElementById("cwidInput");
        cwid.addEventListener("input", (event) => {
            console.log("The event is triggered");
            if (cwid.validity.patternMismatch) {
                cwid.setCustomValidity("CWID must only contain numbers");
                cwid.reportValidity();
            } else {
                cwid.setCustomValidity("");
            }
        });
    }
})();