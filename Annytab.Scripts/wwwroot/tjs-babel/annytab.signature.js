"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// Set default focus
document.querySelector('#fuFile').focus(); // Create a signature

function createSignature() {
  return _createSignature.apply(this, arguments);
} // End of the createSignature method
// Validate signature


function _createSignature() {
  _createSignature = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var data, algorithm, hash;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(location.protocol !== 'https:')) {
              _context.next = 3;
              break;
            }

            annytab.notifier.show('error', 'You need a secure connection (SSL)!');
            return _context.abrupt("return");

          case 3:
            // Disable buttons
            disableButtons(); // Get input data

            data = document.querySelector('#txtSignatureData').value;
            algorithm = document.querySelector('#selectSignatureAlgorithm').value;
            _context.next = 8;
            return getHash(data, algorithm);

          case 8:
            hash = _context.sent;
            // Log selected algorithm and hash
            console.log('Algorithm: ' + algorithm);
            console.log('Hash: ' + hash); // Get the certificate

            window.hwcrypto.getCertificate({
              lang: 'en'
            }).then(function (response) {
              // Get certificate
              certificate = hexToBase64(response.hex);
              document.querySelector('#txtSignatureCertificate').value = certificate;
              console.log('Using certificate:\n' + certificate); // Sign the hash

              window.hwcrypto.sign(response, {
                type: algorithm,
                hex: hash
              }, {
                lang: 'en'
              }).then(function (response) {
                // Get the signature value
                signature_value = hexToBase64(response.hex);
                document.querySelector('#txtSignatureValue').value = signature_value;
                console.log('Signature value:\n' + signature_value); // Enable buttons

                enableButtons(); // Post the form
              }, function (err) {
                // Enable buttons
                enableButtons();

                if (err.message === 'no_implementation') {
                  annytab.notifier.show('error', 'You need to install an extension for smart cards in your browser!');
                } else if (err.message === 'pin_blocked') {
                  annytab.notifier.show('error', 'Your ID-card is blocked!');
                } else if (err.message === 'no_certificates') {
                  annytab.notifier.show('error', 'We could not find any certificates, check your smart card reader.');
                } else if (err.message === 'technical_error') {
                  annytab.notifier.show('error', 'The file could not be signed, your ID-card might not support {0}.'.value.replace('{0}', hashtype.value));
                }
              });
            }, function (err) {
              // Enable buttons
              enableButtons();

              if (err.message === 'no_implementation') {
                annytab.notifier.show('error', 'You need to install an extension for smart cards in your browser!');
              } else if (err.message === 'pin_blocked') {
                annytab.notifier.show('error', 'Your ID-card is blocked!');
              } else if (err.message === 'no_certificates') {
                annytab.notifier.show('error', 'We could not find any certificates, check your smart card reader.');
              } else if (err.message === 'technical_error') {
                annytab.notifier.show('error', 'The file could not be signed, your ID-card might not support {0}.'.value.replace('{0}', hashtype.value));
              }
            });

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createSignature.apply(this, arguments);
}

function validateSignature() {
  // Disable buttons
  disableButtons(); // Create form data

  var fd = new FormData(document.querySelector('#inputForm')); // Post form data

  postFormData('/signature/validate', fd, function (data) {
    if (data.success === true) {
      annytab.notifier.show('success', data.message);
    } else {
      annytab.notifier.show('error', data.message);
    } // Enable buttons


    enableButtons();
  }, function (data) {
    annytab.notifier.show('error', data.message); // Enable buttons

    enableButtons();
  });
} // End of the validateSignature method
// Get a hash of a message


function getHash(_x, _x2) {
  return _getHash.apply(this, arguments);
} // End of the getHash method
// #region MD5
// Convert Md5 to C# version


function _getHash() {
  _getHash = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(data, algorithm) {
    var hashBuffer, hashArray, hashHex;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return crypto.subtle.digest(algorithm, new TextEncoder().encode(data));

          case 2:
            hashBuffer = _context2.sent;
            // Convert buffer to byte array
            hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert bytes to hex string

            hashHex = hashArray.map(function (b) {
              return b.toString(16).padStart(2, '0');
            }).join(''); // Return hash as hex string

            return _context2.abrupt("return", hashHex);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getHash.apply(this, arguments);
}

function convertMd5(str) {
  return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
} // End of the convertMd5 method
// Calculate a MD5 value of a file


function calculateMd5() {
  return _calculateMd.apply(this, arguments);
} // End of the calculateMd5 method
// Load to md5


function _calculateMd() {
  _calculateMd = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var data, loading, file, block_size, offset, spark, reader, start, end, today, dd, mm, yyyy;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // Get the controls
            data = document.querySelector("#txtSignatureData");
            loading = document.querySelector("#loading"); // Get the file

            file = document.querySelector("#fuFile").files[0]; // Make sure that a file is selected

            if (!(typeof file === 'undefined' || file === null)) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt("return");

          case 5:
            // Add a loading animation
            loading.innerHTML = '- 0 %'; // Variables

            block_size = 4 * 1024 * 1024; // 4 MiB

            offset = 0; // Create a spark object

            spark = new SparkMD5.ArrayBuffer();
            reader = new FileReader(); // Create blocks

          case 10:
            if (!(offset < file.size)) {
              _context3.next = 19;
              break;
            }

            // Get the start and end indexes
            start = offset;
            end = Math.min(offset + block_size, file.size);
            _context3.next = 15;
            return loadToMd5(spark, reader, file.slice(start, end));

          case 15:
            loading.innerHTML = '- ' + Math.round(offset / file.size * 100) + ' %'; // Modify the offset and increment the index

            offset = end;
            _context3.next = 10;
            break;

          case 19:
            // Get todays date
            today = new Date();
            dd = String(today.getDate()).padStart(2, '0');
            mm = String(today.getMonth() + 1).padStart(2, '0');
            yyyy = today.getFullYear(); // Output signature data

            data.value = yyyy + '-' + mm + '-' + dd + ',' + convertMd5(spark.end());
            loading.innerHTML = '- 100 %'; // Enable buttons

            enableButtons();

          case 26:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _calculateMd.apply(this, arguments);
}

function loadToMd5(_x3, _x4, _x5) {
  return _loadToMd.apply(this, arguments);
} // End of the loadToMd5 method
// #endregion
// #region form methods
// Post form data


function _loadToMd() {
  _loadToMd = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(spark, reader, chunk) {
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt("return", new Promise(function (resolve, reject) {
              reader.readAsArrayBuffer(chunk);

              reader.onload = function (e) {
                resolve(spark.append(e.target.result));
              };

              reader.onerror = function () {
                reject(reader.abort());
              };
            }));

          case 1:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _loadToMd.apply(this, arguments);
}

function postFormData(url, fd, successCallback, errorCallback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      // Get response
      var data = JSON.parse(xhr.response); // Check success status

      if (data.success === true) {
        // Callback success
        if (successCallback !== null) {
          successCallback(data);
        }
      } else {
        // Callback error
        if (errorCallback !== null) {
          errorCallback(data);
        }
      }
    } else {
      // Callback error information
      data = {
        success: false,
        id: '',
        message: xhr.status + " - " + xhr.statusText
      };

      if (errorCallback !== null) {
        errorCallback(data);
      }
    }
  };

  xhr.onerror = function () {
    // Callback error information
    data = {
      success: false,
      id: '',
      message: xhr.status + " - " + xhr.statusText
    };

    if (errorCallback !== null) {
      errorCallback(data);
    }
  };

  xhr.send(fd);
} // End of the postFormData method
// Disable buttons


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
// #endregion