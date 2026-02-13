var annytab = annytab || {};
annytab.notifier = (function () {

    'use_strict';

    // Variables
    var options = { duration: 10000, position: 'top-center', fade_duration: 1000 };
    var container = null;
    
    // Update options
    function updateOptions(opts)
    {
        // Set default values for parameters
        opts = opts || {};

        // Update options
        for (var option in options)
        {
            if (opts.hasOwnProperty(option) === true)
            {
                options[option] = opts[option];
            }
        }

        // Return options
        return options;

    } // End of the updateOptions method

    // Create a box
    function create(type, message)
    {
        // Make sure that a container exists
        if (container === null)
        {
            container = document.createElement('div');
            container.setAttribute('class', 'annytab-notifier-container annytab-notifier-' + options.position);
            document.body.appendChild(container);
        }

        // Set icon (Font Awesome)
        var icon = '<i class="fas fa-exclamation fa-fw"></i>';
        if (type === 'success') { icon = '<i class="fas fa-check-circle fa-fw"></i>'; }
        else if (type === 'warning') { icon = '<i class="fas fa-exclamation-triangle fa-fw"></i>'; }
        else if (type === 'info') { icon = '<i class="fas fa-info-circle fa-fw"></i>'; }

        // Create a box
        var box = document.createElement('div');
        box.setAttribute('class', 'annytab-notifier-box annytab-notifier-' + type);
        box.insertAdjacentHTML('beforeend',
            '<div class="annytab-notifier-padding">'
            + '<div class="annytab-notifier-icon">' + icon + '</div>'
            + '<div class="annytab-notifier-message">'
            + message
            + '</div>'
            + '<div class="annytab-notifier-progress"></div>'
            + '<div class="annytab-notifier-close"></div >');
            + '</div>';
        container.appendChild(box);

        // Fade in the message box
        annytab.effects.fadeIn(box, options.fade_duration, 'block');

        // Add events
        addBoxEvents(box);

        // Return the box
        return box;

    } // End of the create method

    // Add box events
    function addBoxEvents(box)
    {
        // Variables
        var close_button = box.querySelector('.annytab-notifier-close');
        var progress = box.querySelector('.annytab-notifier-progress');
        var progress_interval = null;
        var close_timeout = null;

        // Add a close event
        window.onload = close_button.addEventListener('click', function (event) {

            // Prevent default click behaviour
            event.preventDefault();

            // Close the box
            close(box);

        }, false);

        // Check if the box should self destruct
        if (options.duration > 0)
        {
            // Add self destruction event
            window.onload = box.addEventListener('mouseleave', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Check if the box is closing
                if (annytab.effects.isVisible(close_button) === false) {
                    return;
                }

                // Display the progress bar
                progress.style.display = 'block';

                // Calculate the amount to decrease each interval
                var width = 100;
                var decrease = width / options.duration * 10;

                // Set an interval to show progress
                progress_interval = window.setInterval(function () {
                    width -= decrease;
                    progress.style.width = width + '%';

                }, 10);

                // Self destruct after some time
                close_timeout = window.setTimeout(function () {

                    // Clear timeout and interval
                    clearTimeout(close_timeout);
                    clearInterval(progress_interval);

                    // Close the box
                    close(box);

                }, options.duration);

            }, false);

            // On focus
            window.onload = box.addEventListener('mouseenter', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Check if the box is closing
                if (annytab.effects.isVisible(close_button) === false)
                {
                    return;
                }

                // Clear timeout and interval
                clearTimeout(close_timeout);
                clearInterval(progress_interval);

                // Reset progress bar
                progress.style.display = 'none';
                progress.style.width = '100%';

            }, false);

            // Trigger a mouse leave event
            box.dispatchEvent(new Event('mouseleave'));
        }

    } // End of the addBoxEvents method

    // Close a box
    function close(box)
    {
        // Get the close button
        var close_button = box.querySelector('.annytab-notifier-close');

        // Check if the box is closing
        if (annytab.effects.isVisible(close_button) === false) {
            return;
        }

        // Hide the close button
        close_button.style.display = 'none';

        // Fade out the box
        annytab.effects.fadeOut(box, options.fade_duration);

        // Wait for the fade effect to finish
        setTimeout(function ()
        {
            // Remove the box
            container.removeChild(box);

            // Check if we should remove the container
            if (container.querySelector('.annytab-notifier-box') === null) {
                document.body.removeChild(container);
                container = null;
            }
            
        }, options.fade_duration);

    } // End of the close method

    // Remove a container
    function removeContainer()
    {
        // Make sure that the container exists
        if (container !== null)
        {
            // Get all boxes in the container
            var boxes = container.querySelectorAll('.annytab-notifier-box');

            // Loop boxes
            for (var i = 0; i < boxes.length; i++) {

                // Close the box
                close(boxes[i]);
            }
        }

    } // End of the removeContainer method

    // Public methods
    return {

        setOptions: function (opts) {

            return updateOptions(opts);
        },
        show: function (type, message)
        {
            return create(type, message);
        },
        clear: function ()
        {
            removeContainer();
        }
    };

})();