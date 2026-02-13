var annytab = annytab || {};
annytab.modalbox = (function () {

    'use_strict';

    // Constructor
    function modalbox(opts)
    {
        // Set default values for parameters
        opts = opts || {};

        // Set options
        this.options = { selector: '.annytab-modalbox-popup', position: 'center-center', fade_duration: 1000, close_click_outside: false };
        for (var option in this.options) {
            if (opts.hasOwnProperty(option) === true) {
                this.options[option] = opts[option];
            }
        }

        // Set variables
        resetVariables(this);
        
        // Get all links that should have a modalbox
        var links = document.querySelectorAll(this.options.selector);

        // Add events
        addLinkEvents(this, links);

    } // End of the constructor

    // Reset variables to default values
    function resetVariables(mb)
    {
        mb.container = null;
        mb.wrapper = null;
        mb.close_button = null;
        mb.cancel_button = null;
        mb.ok_button = null;

    } // End of the resetVariables method

    // Add link events
    function addLinkEvents(mb, links)
    {
        // Loop links
        for (var i = 0; i < links.length; i++)
        {
            // Add a click event
            window.onload = links[i].addEventListener('click', function (event)
            {
                // Prevent default click behaviour
                event.preventDefault();

                // Open modalbox
                openWithHtml(mb, document.querySelector(this.getAttribute('href')).innerHTML, mb.options.position);

            }, false);
        }

    } // End of the addEvents method

    // Add container events
    function addContainerEvents(mb, callback, parameters)
    {
        // Add a close event for close button
        window.onload = mb.close_button.addEventListener('click', function (event)
        {
            // Prevent default click behaviour
            event.preventDefault();

            // Close the container
            mb.close();

        }, false);

        // Add a close event for click outside wrapper
        if (mb.options.close_click_outside === true)
        {
            window.onload = mb.container.addEventListener('click', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Close the modalbox
                if (event.target.contains(mb.wrapper) === true)
                {
                    mb.close();
                }

            }, false);
        }

        // Add a cancel click event
        if (mb.cancel_button !== null)
        {
            window.onload = mb.cancel_button.addEventListener('click', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Disable buttons
                mb.cancel_button.setAttribute('disabled', true);
                mb.ok_button.setAttribute('disabled', true);

                // Close the modalbox
                mb.close();

            }, false);
        }

        // Add a ok click event
        if (mb.ok_button !== null && callback !== null)
        {
            window.onload = mb.ok_button.addEventListener('click', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Disable buttons
                mb.ok_button.setAttribute('disabled', true);
                mb.cancel_button.setAttribute('disabled', true);

                // Call the callback function
                callback(parameters);

            }, false);
        }

    } // End of the addContainerEvents method

    // Open a modalbox with html
    function openWithHtml(mb, html, position, callback, parameters)
    {
        // Add a modalbox
        mb.container = document.createElement('div');
        mb.container.setAttribute('class', 'annytab-modalbox-container');
        mb.container.insertAdjacentHTML('beforeend',
            '<div class="annytab-modalbox-wrapper ' + position + '">'
            + '<div class="annytab-modalbox-padding">'
            + html
            + '</div></div>'
            + '<div class="annytab-modalbox-close"></div >');
        document.body.appendChild(mb.container);

        // Get references
        mb.wrapper = mb.container.querySelector('.annytab-modalbox-wrapper');
        mb.close_button = mb.container.querySelector('.annytab-modalbox-close');
        mb.cancel_button = mb.container.querySelector('.annytab-modalbox-content-button-cancel');
        mb.ok_button = mb.container.querySelector('.annytab-modalbox-content-button-ok');

        // Fade in the container
        annytab.effects.fadeIn(mb.container, mb.options.fade_duration, 'block');

        // Add container events
        addContainerEvents(mb, callback, parameters);

    } // End of the openWithHtml method

    // Open a modalbox
    modalbox.prototype.open = function (input)
    {
        // Get input
        var data = { html: null, position: this.options.position, title: 'Title', message: 'Message', ok_text: 'Ok', cancel_text: 'Cancel', callback: null, parameters: [] };
        for (var option in data) {
            if (input.hasOwnProperty(option) === true) {
                data[option] = input[option];
            }
        }

        // Check if we should create a customized modalbox or a standardized
        if (data.html !== null)
        {
            // Open a modalbox
            openWithHtml(this, data.html, data.position, data.callback, data.parameters);
        }
        else
        {
            var html = '<div class="annytab-modalbox-content">'
                + '<div class="annytab-modalbox-content-title">' + data.title + '</div>'
                + '<div class="annytab-modalbox-content-message">' + data.message + '</div>'
                + '<div class="annytab-modalbox-content-buttonpanel">'
                + '<input type="button" class="annytab-modalbox-content-button-ok" value="' + data.ok_text + '" />'
                + '<input type="button" class="annytab-modalbox-content-button-cancel" value="' + data.cancel_text + '" />'
                + '</div></div>';

            // Open a modalbox
            openWithHtml(this, html, data.position, data.callback, data.parameters);
        }

    }; // End of the open method

    // Close a modalbox
    modalbox.prototype.close = function ()
    {
        // Get a reference to the container
        var box = this.container;

        // Fade out the container
        annytab.effects.fadeOut(box, this.options.fade_duration);

        // Remove the container
        setTimeout(function ()
        {
            document.body.removeChild(box);

        }, this.options.fade_duration);
        
        // Reset variables (GC)
        resetVariables(this);

    }; // End of the close method

    // Return this object
    return modalbox;

})();