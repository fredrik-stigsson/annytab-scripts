var annytab = annytab || {};
annytab.imagepreview = (function () {

    'use_strict';

    // Constructor
    function imagepreview(opts)
    {
        // Set default values for parameters
        opts = opts || {};

        // Set options
        this.options = { image_class: 'annytab-imagepreview', alt: 'Preview' };
        for (var option in this.options) {
            if (opts.hasOwnProperty(option) === true)
            {
                this.options[option] = opts[option];
            }
        }

        // Get all file input controls that should have a preview
        var inputs = document.querySelectorAll('[data-imagepreview-container]');

        // Add events
        addEvents(this, inputs);

    } // End of the constructor

    // Add events
    function addEvents(ip, inputs)
    {
        // Loop inputs
        for (var i = 0; i < inputs.length; i++)
        {
            // Add a change event
            window.onload = inputs[i].addEventListener('change', function (event)
            {
                // Prevent default behaviour
                event.preventDefault();

                // Get a image preview container
                var preview_container = document.getElementById(this.getAttribute('data-imagepreview-container'));

                // Clear the container (fastest way)
                while (preview_container.firstChild) {
                    preview_container.removeChild(preview_container.firstChild);
                }

                // Loop files
                for (var i = 0; i < this.files.length; i++)
                {
                    // Create a file reader
                    var reader = new FileReader();

                    // Load the image
                    reader.onload = function (e)
                    {
                        // Insert image (fastest way)
                        preview_container.insertAdjacentHTML('beforeend', '<img src="' + e.target.result + '" class="' + ip.options.image_class + '" alt="' + ip.options.alt + '" />');
                    };

                    // Read the image
                    reader.readAsDataURL(this.files[i]);
                }

            }, false);
        }

    } // End of the addEvents method

    // Return this object
    return imagepreview;

})();