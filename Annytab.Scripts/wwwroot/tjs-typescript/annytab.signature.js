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
// Set default focus
document.querySelector('#fuFile').focus();
// Create a signature
function createSignature() {
    return __awaiter(this, void 0, void 0, function () {
        var data, algorithm, hash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Make sure that the request is secure (SSL)
                    if (location.protocol !== 'https:') {
                        annytab.notifier.show('error', 'You need a secure connection (SSL)!');
                        return [2 /*return*/];
                    }
                    // Disable buttons
                    disableButtons();
                    data = document.querySelector('#txtSignatureData').value;
                    algorithm = document.querySelector('#selectSignatureAlgorithm').value;
                    return [4 /*yield*/, getHash(data, algorithm)];
                case 1:
                    hash = _a.sent();
                    // Log selected algorithm and hash
                    console.log('Algorithm: ' + algorithm);
                    console.log('Hash: ' + hash);
                    // Get the certificate
                    window.hwcrypto.getCertificate({ lang: 'en' }).then(function (response) {
                        // Get certificate
                        certificate = hexToBase64(response.hex);
                        document.querySelector('#txtSignatureCertificate').value = certificate;
                        console.log('Using certificate:\n' + certificate);
                        // Sign the hash
                        window.hwcrypto.sign(response, { type: algorithm, hex: hash }, { lang: 'en' }).then(function (response) {
                            // Get the signature value
                            signature_value = hexToBase64(response.hex);
                            document.querySelector('#txtSignatureValue').value = signature_value;
                            annytab.notifier.show('success', 'Signature was successfully created!');
                            // Enable buttons
                            enableButtons();
                            // Post the form
                        }, function (err) {
                            // Enable buttons
                            enableButtons();
                            if (err.message === 'no_implementation') {
                                annytab.notifier.show('error', 'You need to install an extension for smart cards in your browser!');
                            }
                            else if (err.message === 'pin_blocked') {
                                annytab.notifier.show('error', 'Your ID-card is blocked!');
                            }
                            else if (err.message === 'no_certificates') {
                                annytab.notifier.show('error', 'We could not find any certificates, check your smart card reader.');
                            }
                            else if (err.message === 'technical_error') {
                                annytab.notifier.show('error', 'The file could not be signed, your ID-card might not support {0}.'.replace('{0}', algorithm));
                            }
                        });
                    }, function (err) {
                        // Enable buttons
                        enableButtons();
                        if (err.message === 'no_implementation') {
                            annytab.notifier.show('error', 'You need to install an extension for smart cards in your browser!');
                        }
                        else if (err.message === 'pin_blocked') {
                            annytab.notifier.show('error', 'Your ID-card is blocked!');
                        }
                        else if (err.message === 'no_certificates') {
                            annytab.notifier.show('error', 'We could not find any certificates, check your smart card reader.');
                        }
                        else if (err.message === 'technical_error') {
                            annytab.notifier.show('error', 'The file could not be signed, your ID-card might not support {0}.'.replace('{0}', algorithm));
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
} // End of the createSignature method
// Validate signature
function validateSignature() {
    // Disable buttons
    disableButtons();
    // Create form data
    var fd = new FormData(document.querySelector('#inputForm'));
    // Post form data
    postFormData('/signature/validate', fd, function (data) {
        if (data.success === true) {
            annytab.notifier.show('success', data.message);
        }
        else {
            annytab.notifier.show('error', data.message);
        }
        // Enable buttons
        enableButtons();
    }, function (data) {
        annytab.notifier.show('error', data.message);
        // Enable buttons
        enableButtons();
    });
} // End of the validateSignature method
// Get a hash of a message
function getHash(data, algorithm) {
    return __awaiter(this, void 0, void 0, function () {
        var hashBuffer, hashArray, hashHex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, crypto.subtle.digest(algorithm, new TextEncoder().encode(data))];
                case 1:
                    hashBuffer = _a.sent();
                    hashArray = Array.from(new Uint8Array(hashBuffer));
                    hashHex = hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
                    // Return hash as hex string
                    return [2 /*return*/, hashHex];
            }
        });
    });
} // End of the getHash method
// #region MD5
// Convert Md5 to C# version
function convertMd5(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
} // End of the convertMd5 method
// Calculate a MD5 value of a file
function calculateMd5() {
    return __awaiter(this, void 0, void 0, function () {
        var data, loading, file, block_size, offset, spark, reader, start, end, today, dd, mm, yyyy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = document.querySelector("#txtSignatureData");
                    loading = document.querySelector("#loading");
                    file = document.querySelector("#fuFile").files[0];
                    // Make sure that a file is selected
                    if (typeof file === 'undefined' || file === null) {
                        return [2 /*return*/];
                    }
                    // Add a loading animation
                    loading.innerHTML = '- 0 %';
                    block_size = 4 * 1024 * 1024;
                    offset = 0;
                    spark = new SparkMD5.ArrayBuffer();
                    reader = new FileReader();
                    _a.label = 1;
                case 1:
                    if (!(offset < file.size)) return [3 /*break*/, 3];
                    start = offset;
                    end = Math.min(offset + block_size, file.size);
                    return [4 /*yield*/, loadToMd5(spark, reader, file.slice(start, end))];
                case 2:
                    _a.sent();
                    loading.innerHTML = '- ' + Math.round((offset / file.size) * 100) + ' %';
                    // Modify the offset and increment the index
                    offset = end;
                    return [3 /*break*/, 1];
                case 3:
                    today = new Date();
                    dd = String(today.getDate()).padStart(2, '0');
                    mm = String(today.getMonth() + 1).padStart(2, '0');
                    yyyy = today.getFullYear();
                    // Output signature data
                    data.value = yyyy + '-' + mm + '-' + dd + ',' + convertMd5(spark.end());
                    loading.innerHTML = '- 100 %';
                    // Enable buttons
                    enableButtons();
                    return [2 /*return*/];
            }
        });
    });
} // End of the calculateMd5 method
// Load to md5
function loadToMd5(spark, reader, chunk) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    reader.readAsArrayBuffer(chunk);
                    reader.onload = function (e) {
                        resolve(spark.append(e.target.result));
                    };
                    reader.onerror = function () {
                        reject(reader.abort());
                    };
                })];
        });
    });
} // End of the loadToMd5 method
// #endregion
// #region Form methods
// Post form data
function postFormData(url, fd, successCallback, errorCallback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Get response
            var data = JSON.parse(xhr.response);
            // Check success status
            if (data.success === true) {
                // Callback success
                if (successCallback !== null) {
                    successCallback(data);
                }
            }
            else {
                // Callback error
                if (errorCallback !== null) {
                    errorCallback(data);
                }
            }
        }
        else {
            // Callback error information
            data = { success: false, id: '', message: xhr.status + " - " + xhr.statusText };
            if (errorCallback !== null) {
                errorCallback(data);
            }
        }
    };
    xhr.onerror = function () {
        // Callback error information
        data = { success: false, id: '', message: xhr.status + " - " + xhr.statusText };
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
        setTimeout(function (button) { button.removeAttribute('disabled'); }, 1000, buttons[i]);
    }
} // End of the enableButtons method
// #endregion
