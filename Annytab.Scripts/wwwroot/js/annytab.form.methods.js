// Submit a form
async function submitForm(form) {

    // Disable buttons
    disableButtons();

    // Make sure that the form is valid
    if (await annytab.validation.valid(form) === false) { enableButtons(); return false; }

    // Get form data
    var fd = new FormData(form);

    // Post form data
    var xhr = new XMLHttpRequest();
    xhr.open('POST', form.getAttribute('action'), true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Get the response
            var data = JSON.parse(xhr.response);

            // Check the success status
            if (data.success === true) {
                // Check if we should redirect the user or show a message
                if (data.url !== null && data.url !== '') {
                    // Redirect the user
                    location.href = data.url;
                }
                else {
                    // Output a success message
                    annytab.notifier.show('success', data.message);
                }
            }
            else {
                // Output error information
                annytab.notifier.show('error', data.message);
            }
        }
        else {
            // Output error information
            annytab.notifier.show('error', xhr.status + " - " + xhr.statusText);
        }

        // Enable buttons
        enableButtons();

    };
    xhr.onerror = function () {
        // Output error information
        annytab.notifier.show('error', xhr.status + " - " + xhr.statusText);

        // Enable buttons
        enableButtons();
    };
    xhr.send(fd);

} // End of the submitForm method

// Disable buttons
function disableButtons()
{
    var buttons = document.getElementsByClassName('btn-disablable');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].setAttribute('disabled', true);
    }

} // End of the disableButtons method

// Enable buttons
function enableButtons()
{
    var buttons = document.getElementsByClassName('btn-disablable');
    for (var i = 0; i < buttons.length; i++) {
        setTimeout(function (button) { button.removeAttribute('disabled'); }, 1000, buttons[i]);
    }

} // End of the enableButtons method