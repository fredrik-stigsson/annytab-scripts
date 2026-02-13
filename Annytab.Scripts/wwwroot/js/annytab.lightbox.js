var annytab = annytab || {};
annytab.lightbox = (function () {

    'use_strict';

    // Constructor
    function lightbox(opts)
    {
        // Set default values for parameters
        opts = opts || {};

        // Set options
        this.options = { selector: '.annytab-lightbox-popup', fade_duration: 1000, close_click_outside: true, slideshow: true, slideshow_interval: 10000 };
        for (var option in this.options) {
            if (opts.hasOwnProperty(option) === true) {
                this.options[option] = opts[option];
            }
        }

        // Set variables
        resetVariables(this);

        // Get all links that should have a lightbox
        var links = document.querySelectorAll(this.options.selector);

        // Add events
        addLinkEvents(this, links);

    } // End of the constructor

    // Reset variables to default values
    function resetVariables(lb)
    {
        lb.current_slide = null;
        lb.last_slide = null;
        lb.container = null;
        lb.wrapper = null;
        lb.close_button = null;
        lb.automatic_slideshow = null;
        lb.left_arrow = null;
        lb.right_arrow = null;
        lb.caption_container = null;

    } // End of the resetVariables method

    // Add events
    function addLinkEvents(lb, links)
    {
        // Loop links
        for (var i = 0; i < links.length; i++)
        {
            // Add a click event
            window.onload = links[i].addEventListener('click', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Open the lightbox
                lb.open(this);

            }, false);
        }

    } // End of the addLinkEvents method

    // Add container events
    function addContainerEvents(lb)
    {
        // Add a close event
        window.onload = lb.close_button.addEventListener('click', function (event) {

            // Prevent default click behaviour
            event.preventDefault();

            // Close the lightbox
            lb.close();

        }, false);

        // Add a close event
        if (lb.options.close_click_outside === true)
        {
            window.onload = lb.container.addEventListener('click', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Close the lightbox
                if (event.target.contains(lb.wrapper) === true)
                {
                    lb.close();
                }

            }, false);
        }

        // Add paging if there is more than 1 slide
        if (lb.last_slide > 0)
        {
            // Show arrows
            lb.left_arrow.style.display = 'block';
            lb.right_arrow.style.display = 'block';

            // Add left arrow click event
            window.onload = lb.left_arrow.addEventListener('click', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Show the previous slide
                lb.showSlide(-1);

                // Turn of the slideshow
                clearInterval(lb.automatic_slideshow);

            }, false);

            // Add right arrow click event
            window.onload = lb.right_arrow.addEventListener('click', function (event) {

                // Prevent default click behaviour
                event.preventDefault();

                // Show the next slide
                lb.showSlide(1);

                // Turn of the slideshow
                clearInterval(lb.automatic_slideshow);

            }, false);

            // Create a slideshow
            if (lb.options.slideshow === true)
            {
                lb.automatic_slideshow = setInterval(function () { lb.showSlide(1); }, lb.options.slideshow_interval);
            }
        }
        else
        {
            // Hide arrows
            lb.left_arrow.style.display = 'none';
            lb.right_arrow.style.display = 'none';
        }

    } // End of the addContainerEvents method

    // Show a slide
    lightbox.prototype.showSlide = function (step)
    {
        // Set the current slide
        this.current_slide += step;

        // Make sure that the slide id not is outside borders
        if (this.current_slide > this.last_slide) {
            this.current_slide = parseInt(0);
        }
        if (this.current_slide < 0) {
            this.current_slide = parseInt(this.last_slide);
        }

        // Get slides
        var slides = this.container.querySelectorAll('.annytab-lightbox-image');
        var next_slide = this.container.querySelector('img[data-lightbox-id="' + this.current_slide + '"]');

        // Set a caption
        var caption = next_slide.getAttribute('data-lightbox-caption');
        if (caption !== null)
        {
            this.caption_container.innerHTML = caption;
            this.caption_container.style.display = 'block';
        }
        else
        {
            this.caption_container.style.display = 'none';
        }

        // Hide slides
        for (var i = 0; i < slides.length; i++)
        {
            slides[i].style.display = 'none';
        }

        // Fade in the next slide
        annytab.effects.fadeIn(next_slide, this.options.fade_duration, 'inline-block');

    }; // End of the showSlide method

    // Open a lightbox
    lightbox.prototype.open = function (link)
    {
        // Get the href attribute
        var href = link.getAttribute('href');

        // Get the group
        var group = link.getAttribute('data-lightbox-group');

        // Get the caption
        var caption = link.getAttribute('data-lightbox-caption');

        // Add the first image
        var source = '<img data-lightbox-id="0" src="' + href + '" class="annytab-lightbox-image" alt="image" style="display:none;"';
        source += caption !== null ? ' data-lightbox-caption="' + caption : '';
        source += '" />';

        // Create a counter
        var counter = 1;

        // Find all images in the group
        var images = document.querySelectorAll('[data-lightbox-group="' + group + '"]');

        // Loop images
        for (var i = 0; i < images.length; i++)
        {
            var url = images[i].getAttribute('href');
            if (url !== href)
            {
                source += '<img data-lightbox-id="' + counter + '" src="' + url + '" class="annytab-lightbox-image" alt="image" style="display:none;"';
                source += images[i].getAttribute('data-lightbox-caption') !== null ? ' data-lightbox-caption="' + images[i].getAttribute('data-lightbox-caption') : '';
                source += '" />';
                counter += 1;
            }
        }
        
        // Get the last slide and set the current slide
        this.last_slide = counter - 1;
        this.current_slide = parseInt(-1);

        // Create a lightbox
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'annytab-lightbox-container');
        this.container.insertAdjacentHTML('beforeend', '<div class="annytab-lightbox-margin">'
            + '<div class="annytab-lightbox-wrapper">'
            + '<div class="annytab-lightbox-padding">'
            + source
            + '<div class="annytab-lightbox-left-arrow"><i class="fas fa-angle-left"></i></div>'
            + '<div class="annytab-lightbox-right-arrow"><i class="fas fa-angle-right"></i></div>'
            + '<div class="annytab-lightbox-caption"></div>'
            + '</div></div></div>'
            + '<div class="annytab-lightbox-close"></div >');
        document.body.appendChild(this.container);

        // Get references
        this.wrapper = this.container.querySelector('.annytab-lightbox-wrapper');
        this.close_button = this.container.querySelector('.annytab-lightbox-close');
        this.caption_container = this.container.querySelector('.annytab-lightbox-caption');
        this.left_arrow = this.container.querySelector('.annytab-lightbox-left-arrow');
        this.right_arrow = this.container.querySelector('.annytab-lightbox-right-arrow');

        // Fade in the container
        annytab.effects.fadeIn(this.container, this.options.fade_duration, 'block');

        // Add container events
        addContainerEvents(this);

        // Show the next slide
        this.showSlide(1);

    }; // End of the open method

    // Close a lightbox
    lightbox.prototype.close = function () {

        // Turn of the slideshow
        clearInterval(this.automatic_slideshow);

        // Fade out the container
        annytab.effects.fadeOut(this.container, this.options.fade_duration);

        // Remove the container
        var box = this.container;
        setTimeout(function ()
        {
            document.body.removeChild(box);

        }, this.options.fade_duration);

        // Reset variables (GC)
        resetVariables(this);

    }; // End of the close method

    // Return this object
    return lightbox;

})();