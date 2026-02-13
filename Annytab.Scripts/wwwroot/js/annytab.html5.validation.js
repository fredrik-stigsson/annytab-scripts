var annytab = annytab || {};
annytab.validation = (function ()
{
    'use_strict';

    // Variables
    var forms = document.getElementsByTagName('form');

    // Loop forms
    for (var i = 0; i < forms.length; i++) {

        // Set forms to not validate, this code will handle validation
        forms[i].noValidate = true;

        // Add submit listener
        window.onload = forms[i].addEventListener('submit', async function (event) {

            // Prevent the form from submitting
            event.preventDefault();

            // Validate a form
            if (await validate(this) === true)
            {
                // Submit the form
                this.submit();
            }

        }, false);

        // Get elements in the form
        var elements = forms[i].querySelectorAll('input, select, textarea');

        // Add listener for elements
        for (var j = 0; j < elements.length; j++)
        {
            // Add input listeners
            elements[j].addEventListener('keydown', removeValidationErrors, false);
            elements[j].addEventListener('mousedown', removeValidationErrors, false);
        }

    } // End of for (var i = 0; i < forms.length; i++)

    // Remove validation errors
    function removeValidationErrors(event)
    {
        // Variables
        var error_output = null;

        // Find equalto element
        var confirmation = event.target.form.querySelector('[data-validation-equalto="' + event.target.getAttribute('name') + '"]');

        // Remove confirmation error
        if (confirmation !== null)
        {
            error_output = event.target.form.querySelector('[data-error-for="' + confirmation.name + '"]');
            if (error_output !== null) { error_output.innerHTML = ''; }
        }

        // Remove all errors for this element
        error_output = event.target.form.querySelector('[data-error-for="' + event.target.getAttribute('name') + '"]');
        if (error_output !== null) { error_output.innerHTML = ''; }

        // Remove IE 11 errors
        removeErrorsIE11(event.target.form);

    } // End of the removeValidationErrors method

    // Validate a form
    async function validate(form)
    {
        // Get elements in the form
        var elements = form.querySelectorAll('input, select, textarea');

        // Remove IE 11 errors
        removeErrorsIE11(form);

        // Create a focus flag
        var focus = false;

        // Loop elements
        for (i = 0; i < elements.length; i++)
        {
            // Get the control
            var ctrl = elements[i];

            // Check if the control should be validated
            if (ctrl.willValidate === false) { continue; }

            // Get error message container
            var error_output = form.querySelector('[data-error-for="' + ctrl.getAttribute('name') + '"]');

            // Get custom validation attributes
            var data_validation_remote = ctrl.getAttribute('data-validation-remote');
            var data_validation_equalto = ctrl.getAttribute('data-validation-equalto');
            var data_validation_file = ctrl.getAttribute('data-validation-file');

            // Get custom error attributes
            var data_error_input = ctrl.getAttribute('data-error-input');
            var data_error_pattern = ctrl.getAttribute('data-error-pattern');
            var data_error_range = ctrl.getAttribute('data-error-range');
            var data_error_step = ctrl.getAttribute('data-error-step');
            var data_error_length = ctrl.getAttribute('data-error-length');
            var data_error_type = ctrl.getAttribute('data-error-type');
            var data_error_required = ctrl.getAttribute('data-error-required');
            var data_error_remote = ctrl.getAttribute('data-error-remote');
            var data_error_equalto = ctrl.getAttribute('data-error-equalto');
            var data_error_file = ctrl.getAttribute('data-error-file');
            var data_error_datalist = ctrl.getAttribute('data-error-datalist');

            // Reset custom validation
            ctrl.setCustomValidity('');

            // Check for errors
            if (ctrl.validity.badInput === true) // parsing error
            {
                if (data_error_input !== null) { ctrl.setCustomValidity(data_error_input); }
            }
            else if (ctrl.validity.patternMismatch === true) // pattern
            {
                if (data_error_pattern !== null) { ctrl.setCustomValidity(data_error_pattern); }
            }
            else if (ctrl.validity.rangeOverflow === true || ctrl.validity.rangeUnderflow === true) // max value or min value
            {
                if (data_error_range !== null) { ctrl.setCustomValidity(data_error_range); }
            }
            else if (ctrl.validity.stepMismatch === true) // step value
            {
                if (data_error_step !== null) { ctrl.setCustomValidity(data_error_step); }
            }
            else if (ctrl.validity.tooLong === true || ctrl.validity.tooShort) // max length or min length
            {
                if (data_error_length !== null) { ctrl.setCustomValidity(data_error_length); }
            }
            else if (ctrl.validity.typeMismatch === true) // input type error
            {
                if (data_error_type !== null) { ctrl.setCustomValidity(data_error_type); }
            }
            else if (ctrl.validity.valueMissing === true) // required
            {
                if (data_error_required !== null) { ctrl.setCustomValidity(data_error_required); }
            }
            else if (data_validation_equalto !== null) // confirmation
            {
                if (equaltoValidation(ctrl, data_validation_equalto) === false) { ctrl.setCustomValidity(data_error_equalto); }
            }
            else if (data_validation_file !== null) // File
            {
                if (fileValidation(ctrl, data_validation_file) === false) { ctrl.setCustomValidity(data_error_file); }
            }
            else if (data_error_datalist !== null) // Datalist
            {
                if (datalistValidation(ctrl) === false) { ctrl.setCustomValidity(data_error_datalist); }
            }
            else if (data_validation_remote !== null) {
                // Perform remote validation
                if (await remoteValidation(ctrl, data_validation_remote) === false) { ctrl.setCustomValidity(data_error_remote); }
            }

            // Set error message in custom control or report validity
            if (ctrl.validationMessage !== '' && error_output !== null) {
                error_output.innerHTML = ctrl.validationMessage;

                // Set focus to the first element
                if (focus === false) { focus = true; ctrl.focus(); }
            }
            else if (ctrl.validationMessage !== '' && ctrl.reportValidity) {
                ctrl.reportValidity();
            }
            else if (ctrl.validationMessage !== '') {
                // IE 11
                ctrl.insertAdjacentHTML('afterend', '<div class="validation-error ie-11-error-output">' + ctrl.validationMessage + '</div>');
            }

        } // for (i = 0; i < elements.length; i++)

        // Return true or false
        return form.checkValidity();

    } // End of the validate method

    // Perform equalto validation
    function equaltoValidation(ctrl, other_field)
    {
        // Get the value of the other field
        var other_value = document.getElementsByName(other_field)[0].value;

        // Check if values are different
        if (ctrl.value !== other_value) {
            return false;
        }

        // Return true
        return true;

    } // End of the equaltoValidation method

    // Perform file validation
    function fileValidation(ctrl, max_size)
    {
        // Make sure that there is files
        if (ctrl.files.length <= 0) {
            return true;
        }

        // Check accept attribute
        var accepts = ctrl.getAttribute('accept') !== null ? ctrl.getAttribute('accept').toLowerCase().replace(' ', '').split(',') : null;

        // Loop files
        for (var i = 0; i < ctrl.files.length; i++) {
            // Get the file extension
            var extension = ctrl.files[i].name.substring(ctrl.files[i].name.lastIndexOf('.')).toLowerCase();

            // Check for errors
            if (accepts !== null && accepts.includes(extension) === false) {
                return false;
            }
            else if (max_size !== null && max_size > 0 && ctrl.files[i].size >= max_size) {
                return false;
            }
        }

        // Return true
        return true;

    } // End of the fileValidation method

    // Perform a datalist validation
    function datalistValidation(ctrl)
    {
        // Loop options
        for (var i = 0; i < ctrl.list.options.length; i++) {
            if (ctrl.value === ctrl.list.options[i].value) {
                return true;
            }
        }

        // Return false
        return false;

    } // End of the datalistValidation method

    // Perform remote validation
    async function remoteValidation(ctrl, input)
    {
        // Return a promise
        return new Promise((resolve, reject) => {

            // Get input values
            var values = input.split(',');
            var uri = values[0].trim();
            var fields = [];
            fields.push(ctrl.getAttribute('name'));
            for (var i = 1; i < values.length; i++) { fields.push(values[i].trim()); }

            // Create form data
            var fd = new FormData();
            for (i = 0; i < fields.length; i++) { fd.append(fields[i], document.getElementsByName(fields[i])[0].value); }

            var xhr = new XMLHttpRequest();
            xhr.open('POST', uri, true);
            xhr.onload = function () {

                // Check if the response is successful
                if (xhr.status === 200) {
                    // Return a success response
                    if (xhr.response === 'false') { resolve(false); } else { resolve(true); }
                }
                else {
                    // Return a reject response
                    reject(xhr.status + ' ' + xhr.statusText);
                }
            };
            xhr.onerror = function () {
                // Return a reject response
                reject('There was a network error.');
            };
            xhr.send(fd);
        });

    } // End of the remoteValidation method

    // Remove IE 11 errors
    function removeErrorsIE11(form)
    {
        var ie_errors = form.querySelectorAll('.ie-11-error-output');
        for (var i = 0; i < ie_errors.length; i++) { ie_errors[i].remove(); }

    } // End of the removeErrorsIE11 method

    // Public methods
    return {
        valid: async function (form) {
            return await validate(form);
        }
    };

})();