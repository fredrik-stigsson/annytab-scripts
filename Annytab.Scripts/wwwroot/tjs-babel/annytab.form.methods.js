"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Submit a form
function submitForm(_x) {
  return _submitForm.apply(this, arguments);
} // End of the submitForm method
// Disable buttons


function _submitForm() {
  _submitForm = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(form) {
    var fd, xhr;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Disable buttons
            disableButtons(); // Make sure that the form is valid

            _context.next = 3;
            return annytab.validation.valid(form);

          case 3:
            _context.t0 = _context.sent;

            if (!(_context.t0 === false)) {
              _context.next = 7;
              break;
            }

            enableButtons();
            return _context.abrupt("return", false);

          case 7:
            // Get form data
            fd = new FormData(form); // Post form data

            xhr = new XMLHttpRequest();
            xhr.open('POST', form.getAttribute('action'), true);

            xhr.onload = function () {
              if (xhr.status === 200) {
                // Get the response
                var data = JSON.parse(xhr.response); // Check the success status

                if (data.success === true) {
                  // Check if we should redirect the user or show a message
                  if (data.url !== null && data.url !== '') {
                    // Redirect the user
                    location.href = data.url;
                  } else {
                    // Output a success message
                    annytab.notifier.show('success', data.message);
                  }
                } else {
                  // Output error information
                  annytab.notifier.show('error', data.message);
                }
              } else {
                // Output error information
                annytab.notifier.show('error', xhr.status + " - " + xhr.statusText);
              } // Enable buttons


              enableButtons();
            };

            xhr.onerror = function () {
              // Output error information
              annytab.notifier.show('error', xhr.status + " - " + xhr.statusText); // Enable buttons

              enableButtons();
            };

            xhr.send(fd);

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _submitForm.apply(this, arguments);
}

function disableButtons() {
  var buttons = document.getElementsByClassName('btn-disablable');

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].setAttribute('disabled', true);
  }
} // End of the disableButtons method
// Enable buttons


function enableButtons() {
  var buttons = document.getElementsByClassName('btn-disablable');

  for (var i = 0; i < buttons.length; i++) {
    setTimeout(function (button) {
      button.removeAttribute('disabled');
    }, 1000, buttons[i]);
  }
} // End of the enableButtons method