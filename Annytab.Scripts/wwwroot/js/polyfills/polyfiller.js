(function () {

    'use_strict';

    if (!Element.prototype.closest) {
        loadScript('/js/polyfills/element.prototype.closest.min.js');
    }
    if (!Array.from) {
        loadScript('/js/polyfills/array.from.min.js');
    }
    if (!Array.prototype.includes) {
        loadScript('/js/polyfills/array.prototype.includes.min.js');
    }
    if (typeof window.CustomEvent !== 'function') {
        loadScript('/js/polyfills/customevent.min.js');
    }
    if (!window.Promise) {
        loadScript('/js/polyfills/promise.min.js');
    }
    if (!window.XMLHttpRequest) {
        loadScript('/js/polyfills/xmlhttprequest.min.js');
    }
    if (!Element.prototype.remove) {
        loadScript('/js/polyfills/element.prototype.remove.min.js');
    }
    if (!String.prototype.endsWith) {
        loadScript('/js/polyfills/string.prototype.endswith.min.js');
    }
    if (!String.prototype.includes) {
        loadScript('/js/polyfills/string.prototype.includes.min.js');
    }
    if (!String.prototype.padStart) {
        loadScript('/js/polyfills/string.prototype.padstart.min.js');
    }
    if (!window.requestAnimationFrame) {
        loadScript('/js/polyfills/requestanimationframe.min.js');
    }
    if (!window.crypto) {
        loadScript('/js/polyfills/webcrypto-shim.min.js');
    }
    if (typeof TextEncoder === 'undefined') {
        loadScript('/js/polyfills/textencoder.min.js');
    }
    if ('options' in document.createElement('datalist') === false) {
        loadScript('/js/polyfills/html5.datalist.min.js');
    }

    // Load a script file synchronous
    function loadScript(src) {
        var js = document.createElement('script');
        js.src = src;
        js.async = false;
        document.body.appendChild(js);

    } // End of the loadScript method

})();