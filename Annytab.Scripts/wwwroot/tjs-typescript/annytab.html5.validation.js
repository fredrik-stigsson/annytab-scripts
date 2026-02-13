var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var annytab = annytab || {};
annytab.validation = (function () {
    'use_strict';
    // Variables
    var forms = document.getElementsByTagName('form');
    // Loop forms
    for (var i = 0; i < forms.length; i++) {
        // Set forms to not validate, this code will handle validation
        forms[i].noValidate = true;
        // Add submit listener
        window.onload = forms[i].addEventListener('submit', function (event) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Prevent the form from submitting
                            event.preventDefault();
                            return [4 /*yield*/, validate(this)];
                        case 1:
                            // Validate a form
                            if ((_a.sent()) === true) {
                                // Submit the form
                                this.submit();
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }, false);
        // Get elements in the form
        var elements = forms[i].querySelectorAll('input, select, textarea');
        // Add listener for elements
        for (var j = 0; j < elements.length; j++) {
            // Add input listeners
            elements[j].addEventListener('keydown', removeValidationErrors, false);
            elements[j].addEventListener('mousedown', removeValidationErrors, false);
        }
    } // End of for (var i = 0; i < forms.length; i++)
    // Remove validation errors
    function removeValidationErrors(event) {
        // Variables
        var error_output = null;
        // Find equalto element
        var confirmation = event.target.form.querySelector('[data-validation-equalto="' + event.target.getAttribute('name') + '"]');
        // Remove confirmation error
        if (confirmation !== null) {
            error_output = event.target.form.querySelector('[data-error-for="' + confirmation.name + '"]');
            if (error_output !== null) {
                error_output.innerHTML = '';
            }
        }
        // Remove all errors for this element
        error_output = event.target.form.querySelector('[data-error-for="' + event.target.getAttribute('name') + '"]');
        if (error_output !== null) {
            error_output.innerHTML = '';
        }
        // Remove IE 11 errors
        removeErrorsIE11(event.target.form);
    } // End of the removeValidationErrors method
    // Validate a form
    function validate(form) {
        return __awaiter(this, void 0, void 0, function () {
            var elements, focus, ctrl, error_output, data_validation_remote, data_validation_equalto, data_validation_file, data_error_input, data_error_pattern, data_error_range, data_error_step, data_error_length, data_error_type, data_error_required, data_error_remote, data_error_equalto, data_error_file, data_error_datalist;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        elements = form.querySelectorAll('input, select, textarea');
                        // Remove IE 11 errors
                        removeErrorsIE11(form);
                        focus = false;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < elements.length)) return [3 /*break*/, 15];
                        ctrl = elements[i];
                        // Check if the control should be validated
                        if (ctrl.willValidate === false) {
                            return [3 /*break*/, 14];
                        }
                        error_output = form.querySelector('[data-error-for="' + ctrl.getAttribute('name') + '"]');
                        data_validation_remote = ctrl.getAttribute('data-validation-remote');
                        data_validation_equalto = ctrl.getAttribute('data-validation-equalto');
                        data_validation_file = ctrl.getAttribute('data-validation-file');
                        data_error_input = ctrl.getAttribute('data-error-input');
                        data_error_pattern = ctrl.getAttribute('data-error-pattern');
                        data_error_range = ctrl.getAttribute('data-error-range');
                        data_error_step = ctrl.getAttribute('data-error-step');
                        data_error_length = ctrl.getAttribute('data-error-length');
                        data_error_type = ctrl.getAttribute('data-error-type');
                        data_error_required = ctrl.getAttribute('data-error-required');
                        data_error_remote = ctrl.getAttribute('data-error-remote');
                        data_error_equalto = ctrl.getAttribute('data-error-equalto');
                        data_error_file = ctrl.getAttribute('data-error-file');
                        data_error_datalist = ctrl.getAttribute('data-error-datalist');
                        // Reset custom validation
                        ctrl.setCustomValidity('');
                        if (!(ctrl.validity.badInput === true)) return [3 /*break*/, 2];
                        if (data_error_input !== null) {
                            ctrl.setCustomValidity(data_error_input);
                        }
                        return [3 /*break*/, 13];
                    case 2:
                        if (!(ctrl.validity.patternMismatch === true)) return [3 /*break*/, 3];
                        if (data_error_pattern !== null) {
                            ctrl.setCustomValidity(data_error_pattern);
                        }
                        return [3 /*break*/, 13];
                    case 3:
                        if (!(ctrl.validity.rangeOverflow === true || ctrl.validity.rangeUnderflow === true)) return [3 /*break*/, 4];
                        if (data_error_range !== null) {
                            ctrl.setCustomValidity(data_error_range);
                        }
                        return [3 /*break*/, 13];
                    case 4:
                        if (!(ctrl.validity.stepMismatch === true)) return [3 /*break*/, 5];
                        if (data_error_step !== null) {
                            ctrl.setCustomValidity(data_error_step);
                        }
                        return [3 /*break*/, 13];
                    case 5:
                        if (!(ctrl.validity.tooLong === true || ctrl.validity.tooShort)) return [3 /*break*/, 6];
                        if (data_error_length !== null) {
                            ctrl.setCustomValidity(data_error_length);
                        }
                        return [3 /*break*/, 13];
                    case 6:
                        if (!(ctrl.validity.typeMismatch === true)) return [3 /*break*/, 7];
                        if (data_error_type !== null) {
                            ctrl.setCustomValidity(data_error_type);
                        }
                        return [3 /*break*/, 13];
                    case 7:
                        if (!(ctrl.validity.valueMissing === true)) return [3 /*break*/, 8];
                        if (data_error_required !== null) {
                            ctrl.setCustomValidity(data_error_required);
                        }
                        return [3 /*break*/, 13];
                    case 8:
                        if (!(data_validation_equalto !== null)) return [3 /*break*/, 9];
                        if (equaltoValidation(ctrl, data_validation_equalto) === false) {
                            ctrl.setCustomValidity(data_error_equalto);
                        }
                        return [3 /*break*/, 13];
                    case 9:
                        if (!(data_validation_file !== null)) return [3 /*break*/, 10];
                        if (fileValidation(ctrl, data_validation_file) === false) {
                            ctrl.setCustomValidity(data_error_file);
                        }
                        return [3 /*break*/, 13];
                    case 10:
                        if (!(data_error_datalist !== null)) return [3 /*break*/, 11];
                        if (datalistValidation(ctrl) === false) {
                            ctrl.setCustomValidity(data_error_datalist);
                        }
                        return [3 /*break*/, 13];
                    case 11:
                        if (!(data_validation_remote !== null)) return [3 /*break*/, 13];
                        return [4 /*yield*/, remoteValidation(ctrl, data_validation_remote)];
                    case 12:
                        // Perform remote validation
                        if ((_a.sent()) === false) {
                            ctrl.setCustomValidity(data_error_remote);
                        }
                        _a.label = 13;
                    case 13:
                        // Set error message in custom control or report validity
                        if (ctrl.validationMessage !== '' && error_output !== null) {
                            error_output.innerHTML = ctrl.validationMessage;
                            // Set focus to the first element
                            if (focus === false) {
                                focus = true;
                                ctrl.focus();
                            }
                        }
                        else if (ctrl.validationMessage !== '' && ctrl.reportValidity) {
                            ctrl.reportValidity();
                        }
                        else if (ctrl.validationMessage !== '') {
                            // IE 11
                            ctrl.insertAdjacentHTML('afterend', '<div class="validation-error ie-11-error-output">' + ctrl.validationMessage + '</div>');
                        }
                        _a.label = 14;
                    case 14:
                        i++;
                        return [3 /*break*/, 1];
                    case 15: // for (i = 0; i < elements.length; i++)
                    // Return true or false
                    return [2 /*return*/, form.checkValidity()];
                }
            });
        });
    } // End of the validate method
    // Perform equalto validation
    function equaltoValidation(ctrl, other_field) {
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
    function fileValidation(ctrl, max_size) {
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
    function datalistValidation(ctrl) {
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
    function remoteValidation(ctrl, input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Return a promise
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // Get input values
                        var values = input.split(',');
                        var uri = values[0].trim();
                        var fields = [];
                        fields.push(ctrl.getAttribute('name'));
                        for (var i = 1; i < values.length; i++) {
                            fields.push(values[i].trim());
                        }
                        // Create form data
                        var fd = new FormData();
                        for (i = 0; i < fields.length; i++) {
                            fd.append(fields[i], document.getElementsByName(fields[i])[0].value);
                        }
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', uri, true);
                        xhr.onload = function () {
                            // Check if the response is successful
                            if (xhr.status === 200) {
                                // Return a success response
                                if (xhr.response === 'false') {
                                    resolve(false);
                                }
                                else {
                                    resolve(true);
                                }
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
                    })];
            });
        });
    } // End of the remoteValidation method
    // Remove IE 11 errors
    function removeErrorsIE11(form) {
        var ie_errors = form.querySelectorAll('.ie-11-error-output');
        for (var i = 0; i < ie_errors.length; i++) {
            ie_errors[i].remove();
        }
    } // End of the removeErrorsIE11 method
    // Public methods
    return {
        valid: function (form) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, validate(form)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
    };
})();
