var annytab = annytab || {};
annytab.effects = (function () {
    'use_strict';
    // Public methods
    return {
        slideDown: function (el, duration, display) {
            // Return if the element is visible
            if (this.isVisible(el) === true) {
                return;
            }
            // Set default values for parameters
            duration = duration || 1000;
            display = display || 'block';
            // Display the element
            el.style.display = display;
            // Create variables
            var start = null;
            var height = el.offsetHeight;
            var overflow = el.style.overflow;
            // Set height and hide overflow
            el.style.height = '0';
            el.style.overflow = 'hidden';
            // Run animation
            function run(timestamp) {
                // Set start time
                if (!start)
                    start = timestamp;
                // Calculate progress
                var progress = height * ((timestamp - start) / duration);
                // Set element height
                el.style.height = Math.min(progress, height) + 'px';
                // Check if the animation should end
                if (progress < height) {
                    window.requestAnimationFrame(run);
                }
                else {
                    // Reset element
                    el.style.height = '';
                    el.style.overflow = overflow;
                }
            }
            // Start animation
            window.requestAnimationFrame(run);
            // Return the element
            return el;
        },
        slideUp: function (el, duration) {
            // Return if the element not is visible
            if (this.isVisible(el) === false) {
                return;
            }
            // Set default values for parameters
            duration = duration || 1000;
            // Create variables
            var start = null;
            var height = el.offsetHeight;
            var overflow = el.style.overflow;
            // Hide overflow
            el.style.overflow = 'hidden';
            // Run animation
            function run(timestamp) {
                // Set start time
                if (!start)
                    start = timestamp;
                // Calculate progress
                var progress = height - (height * ((timestamp - start) / duration));
                // Set element height
                el.style.height = Math.max(progress, 0) + 'px';
                // Check if the animation should end
                if (progress > 0) {
                    window.requestAnimationFrame(run);
                }
                else {
                    // Reset element
                    el.style.display = 'none';
                    el.style.height = '';
                    el.style.overflow = overflow;
                }
            }
            // Start animation
            window.requestAnimationFrame(run);
            // Return the element
            return el;
        },
        slideToggle: function (el, duration, display) {
            // Set default values for parameters
            duration = duration || 1000;
            display = display || 'block';
            // Check if we should slide up or slide down
            if (this.isVisible(el) === true) {
                this.slideUp(el, duration);
            }
            else {
                this.slideDown(el, duration, display);
            }
            // Return the element
            return el;
        },
        fadeIn: function (el, duration, display) {
            // Return if the element is visible
            if (this.isVisible(el) === true) {
                return;
            }
            // Set default values for parameters
            duration = duration || 1000;
            display = display || 'block';
            // Display the element
            el.style.display = display;
            // Create variables
            var start = null;
            // Set opacity
            el.style.opacity = 0.00;
            el.style.filter = 'alpha(opacity=0)'; /* For IE8 and earlier */
            // Run animation
            function run(timestamp) {
                // Set start time
                if (!start)
                    start = timestamp;
                // Calculate progress
                var progress = 100 * (timestamp - start) / duration;
                // Set element opacity
                el.style.opacity = Math.min(progress, 100) / 100;
                el.style.filter = 'alpha(opacity=' + Math.min(progress, 100) + ')'; /* For IE8 and earlier */
                // Check if the animation should end
                if (progress < 100) {
                    window.requestAnimationFrame(run);
                }
                else {
                    // Reset element
                    el.style.opacity = '';
                    el.style.filter = ''; /* For IE8 and earlier */
                }
            }
            // Start animation
            window.requestAnimationFrame(run);
            // Return the element
            return el;
        },
        fadeOut: function (el, duration) {
            // Return if the element not is visible
            if (this.isVisible(el) === false) {
                return;
            }
            // Set default values for parameters
            duration = duration || 1000;
            // Create variables
            var start = null;
            // Set opacity
            el.style.opacity = 1.00;
            el.style.filter = 'alpha(opacity=100)'; /* For IE8 and earlier */
            // Run animation
            function run(timestamp) {
                // Set start time
                if (!start)
                    start = timestamp;
                // Calculate progress
                var progress = 100 - (100 * ((timestamp - start) / duration));
                // Set element opacity
                el.style.opacity = Math.max(progress, 0) / 100;
                el.style.filter = 'alpha(opacity=' + Math.max(progress, 0) + ')'; /* For IE8 and earlier */
                // Check if the animation should end
                if (progress > 0) {
                    window.requestAnimationFrame(run);
                }
                else {
                    // Reset element
                    el.style.display = 'none';
                    el.style.opacity = '';
                    el.style.filter = ''; /* For IE8 and earlier */
                }
            }
            // Start animation
            window.requestAnimationFrame(run);
            // Return the element
            return el;
        },
        fadeToggle: function (el, duration, display) {
            // Set default values for parameters
            duration = duration || 1000;
            display = display || 'block';
            // Check if we should fade out or fade in
            if (this.isVisible(el) === true) {
                this.fadeOut(el, duration);
            }
            else {
                this.fadeIn(el, duration, display);
            }
            // Return the element
            return el;
        },
        isVisible: function (el) {
            if (typeof el === 'undefined' || el === null) {
                return false;
            }
            return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        }
    };
})();
