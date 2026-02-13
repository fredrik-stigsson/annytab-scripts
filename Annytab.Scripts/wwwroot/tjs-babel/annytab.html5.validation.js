"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var annytab = annytab || {};

annytab.validation = function () {
  'use_strict'; // Variables

  var forms = document.getElementsByTagName('form'); // Loop forms

  for (var i = 0; i < forms.length; i++) {
    // Set forms to not validate, this code will handle validation
    forms[i].noValidate = true; // Add submit listener

    window.onload = forms[i].addEventListener('submit',
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(event) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // Prevent the form from submitting
                event.preventDefault(); // Validate a form

                _context.next = 3;
                return validate(this);

              case 3:
                _context.t0 = _context.sent;

                if (!(_context.t0 === true)) {
                  _context.next = 6;
                  break;
                }

                // Submit the form
                this.submit();

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }(), false); // Get elements in the form

    var elements = forms[i].querySelectorAll('input, select, textarea'); // Add listener for elements

    for (var j = 0; j < elements.length; j++) {
      // Add input listeners
      elements[j].addEventListener('keydown', removeValidationErrors, false);
      elements[j].addEventListener('mousedown', removeValidationErrors, false);
    }
  } // End of for (var i = 0; i < forms.length; i++)
  // Remove validation errors


  function removeValidationErrors(event) {
    // Variables
    var error_output = null; // Find equalto element

    var confirmation = event.target.form.querySelector('[data-validation-equalto="' + event.target.getAttribute('name') + '"]'); // Remove confirmation error

    if (confirmation !== null) {
      error_output = event.target.form.querySelector('[data-error-for="' + confirmation.name + '"]');

      if (error_output !== null) {
        error_output.innerHTML = '';
      }
    } // Remove all errors for this element


    error_output = event.target.form.querySelector('[data-error-for="' + event.target.getAttribute('name') + '"]');

    if (error_output !== null) {
      error_output.innerHTML = '';
    } // Remove IE 11 errors


    removeErrorsIE11(event.target.form);
  } // End of the removeValidationErrors method
  // Validate a form


  function validate(_x2) {
    return _validate.apply(this, arguments);
  } // End of the validate method
  // Perform equalto validation


  function _validate() {
    _validate = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(form) {
      var elements, focus, ctrl, error_output, data_validation_remote, data_validation_equalto, data_validation_file, data_error_input, data_error_pattern, data_error_range, data_error_step, data_error_length, data_error_type, data_error_required, data_error_remote, data_error_equalto, data_error_file, data_error_datalist;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // Get elements in the form
              elements = form.querySelectorAll('input, select, textarea'); // Remove IE 11 errors

              removeErrorsIE11(form); // Create a focus flag

              focus = false; // Loop elements

              i = 0;

            case 4:
              if (!(i < elements.length)) {
                _context3.next = 74;
                break;
              }

              // Get the control
              ctrl = elements[i]; // Check if the control should be validated

              if (!(ctrl.willValidate === false)) {
                _context3.next = 8;
                break;
              }

              return _context3.abrupt("continue", 71);

            case 8:
              // Get error message container
              error_output = form.querySelector('[data-error-for="' + ctrl.getAttribute('name') + '"]'); // Get custom validation attributes

              data_validation_remote = ctrl.getAttribute('data-validation-remote');
              data_validation_equalto = ctrl.getAttribute('data-validation-equalto');
              data_validation_file = ctrl.getAttribute('data-validation-file'); // Get custom error attributes

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
              data_error_datalist = ctrl.getAttribute('data-error-datalist'); // Reset custom validation

              ctrl.setCustomValidity(''); // Check for errors

              if (!(ctrl.validity.badInput === true)) {
                _context3.next = 28;
                break;
              }

              if (data_error_input !== null) {
                ctrl.setCustomValidity(data_error_input);
              }

              _context3.next = 70;
              break;

            case 28:
              if (!(ctrl.validity.patternMismatch === true)) {
                _context3.next = 32;
                break;
              }

              if (data_error_pattern !== null) {
                ctrl.setCustomValidity(data_error_pattern);
              }

              _context3.next = 70;
              break;

            case 32:
              if (!(ctrl.validity.rangeOverflow === true || ctrl.validity.rangeUnderflow === true)) {
                _context3.next = 36;
                break;
              }

              if (data_error_range !== null) {
                ctrl.setCustomValidity(data_error_range);
              }

              _context3.next = 70;
              break;

            case 36:
              if (!(ctrl.validity.stepMismatch === true)) {
                _context3.next = 40;
                break;
              }

              if (data_error_step !== null) {
                ctrl.setCustomValidity(data_error_step);
              }

              _context3.next = 70;
              break;

            case 40:
              if (!(ctrl.validity.tooLong === true || ctrl.validity.tooShort)) {
                _context3.next = 44;
                break;
              }

              if (data_error_length !== null) {
                ctrl.setCustomValidity(data_error_length);
              }

              _context3.next = 70;
              break;

            case 44:
              if (!(ctrl.validity.typeMismatch === true)) {
                _context3.next = 48;
                break;
              }

              if (data_error_type !== null) {
                ctrl.setCustomValidity(data_error_type);
              }

              _context3.next = 70;
              break;

            case 48:
              if (!(ctrl.validity.valueMissing === true)) {
                _context3.next = 52;
                break;
              }

              if (data_error_required !== null) {
                ctrl.setCustomValidity(data_error_required);
              }

              _context3.next = 70;
              break;

            case 52:
              if (!(data_validation_equalto !== null)) {
                _context3.next = 56;
                break;
              }

              if (equaltoValidation(ctrl, data_validation_equalto) === false) {
                ctrl.setCustomValidity(data_error_equalto);
              }

              _context3.next = 70;
              break;

            case 56:
              if (!(data_validation_file !== null)) {
                _context3.next = 60;
                break;
              }

              if (fileValidation(ctrl, data_validation_file) === false) {
                ctrl.setCustomValidity(data_error_file);
              }

              _context3.next = 70;
              break;

            case 60:
              if (!(data_error_datalist !== null)) {
                _context3.next = 64;
                break;
              }

              if (datalistValidation(ctrl) === false) {
                ctrl.setCustomValidity(data_error_datalist);
              }

              _context3.next = 70;
              break;

            case 64:
              if (!(data_validation_remote !== null)) {
                _context3.next = 70;
                break;
              }

              _context3.next = 67;
              return remoteValidation(ctrl, data_validation_remote);

            case 67:
              _context3.t0 = _context3.sent;

              if (!(_context3.t0 === false)) {
                _context3.next = 70;
                break;
              }

              ctrl.setCustomValidity(data_error_remote);

            case 70:
              // Set error message in custom control or report validity
              if (ctrl.validationMessage !== '' && error_output !== null) {
                error_output.innerHTML = ctrl.validationMessage; // Set focus to the first element

                if (focus === false) {
                  focus = true;
                  ctrl.focus();
                }
              } else if (ctrl.validationMessage !== '' && ctrl.reportValidity) {
                ctrl.reportValidity();
              } else if (ctrl.validationMessage !== '') {
                // IE 11
                ctrl.insertAdjacentHTML('afterend', '<div class="validation-error ie-11-error-output">' + ctrl.validationMessage + '</div>');
              }

            case 71:
              i++;
              _context3.next = 4;
              break;

            case 74:
              return _context3.abrupt("return", form.checkValidity());

            case 75:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));
    return _validate.apply(this, arguments);
  }

  function equaltoValidation(ctrl, other_field) {
    // Get the value of the other field
    var other_value = document.getElementsByName(other_field)[0].value; // Check if values are different

    if (ctrl.value !== other_value) {
      return false;
    } // Return true


    return true;
  } // End of the equaltoValidation method
  // Perform file validation


  function fileValidation(ctrl, max_size) {
    // Make sure that there is files
    if (ctrl.files.length <= 0) {
      return true;
    } // Check accept attribute


    var accepts = ctrl.getAttribute('accept') !== null ? ctrl.getAttribute('accept').toLowerCase().replace(' ', '').split(',') : null; // Loop files

    for (var i = 0; i < ctrl.files.length; i++) {
      // Get the file extension
      var extension = ctrl.files[i].name.substring(ctrl.files[i].name.lastIndexOf('.')).toLowerCase(); // Check for errors

      if (accepts !== null && accepts.includes(extension) === false) {
        return false;
      } else if (max_size !== null && max_size > 0 && ctrl.files[i].size >= max_size) {
        return false;
      }
    } // Return true


    return true;
  } // End of the fileValidation method
  // Perform a datalist validation


  function datalistValidation(ctrl) {
    // Loop options
    for (var i = 0; i < ctrl.list.options.length; i++) {
      if (ctrl.value === ctrl.list.options[i].value) {
        return true;
      }
    } // Return false


    return false;
  } // End of the datalistValidation method
  // Perform remote validation


  function remoteValidation(_x3, _x4) {
    return _remoteValidation.apply(this, arguments);
  } // End of the remoteValidation method
  // Remove IE 11 errors


  function _remoteValidation() {
    _remoteValidation = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4(ctrl, input) {
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", new Promise(function (resolve, reject) {
                // Get input values
                var values = input.split(',');
                var uri = values[0].trim();
                var fields = [];
                fields.push(ctrl.getAttribute('name'));

                for (var i = 1; i < values.length; i++) {
                  fields.push(values[i].trim());
                } // Create form data


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
                    } else {
                      resolve(true);
                    }
                  } else {
                    // Return a reject response
                    reject(xhr.status + ' ' + xhr.statusText);
                  }
                };

                xhr.onerror = function () {
                  // Return a reject response
                  reject('There was a network error.');
                };

                xhr.send(fd);
              }));

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));
    return _remoteValidation.apply(this, arguments);
  }

  function removeErrorsIE11(form) {
    var ie_errors = form.querySelectorAll('.ie-11-error-output');

    for (var i = 0; i < ie_errors.length; i++) {
      ie_errors[i].remove();
    }
  } // End of the removeErrorsIE11 method
  // Public methods


  return {
    valid: function () {
      var _valid = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(form) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return validate(form);

              case 2:
                return _context2.abrupt("return", _context2.sent);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function valid(_x5) {
        return _valid.apply(this, arguments);
      }

      return valid;
    }()
  };
}();