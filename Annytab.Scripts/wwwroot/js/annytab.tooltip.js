(function () {

    'use_strict';

    // Get all targets
    var targets = document.querySelectorAll('[rel="tooltip"]');

    // Loop targets
    for (var i = 0; i < targets.length; i++) {

        // Add listeners
        targets[i].addEventListener('mouseenter', function ()
        {
            addTooltip(this, document.querySelector('.annytab-tooltip'));

        }, false);
        targets[i].addEventListener('mouseleave', function ()
        {
            removeTooltip(this, document.querySelector('.annytab-tooltip'));

        }, false);
        targets[i].addEventListener('click', function () {

            // Get the active tooltip
            var tooltip = document.querySelector('.annytab-tooltip');

            // Get the target
            var target = event.target.closest('[rel="tooltip"]');

            // Check if the tooltip exists or not
            if (tooltip === null)
            {
                // Add a tooltip
                addTooltip(target, tooltip);
            }
            else
            {
                // Remove a tooltip
                removeTooltip(target, tooltip);
            }

        }, false);

    } // End of for (var i = 0; i < targets.length; i++)

    // Add a tooltip
    function addTooltip(target, tooltip)
    {
        // Get the title
        var title = target.getAttribute('title');

        // Make sure that title not is null or empty
        if (title === null || title === '' || tooltip !== null)
        {
            return false;
        }

        // Remove the title of the target
        target.removeAttribute('title');

        // Add a tooltip
        tooltip = document.createElement('div');
        tooltip.setAttribute('class', 'annytab-tooltip');
        tooltip.innerHTML = title;
        target.insertAdjacentElement('beforeend', tooltip);

        // Initiate the tooltip
        tooltip.style.right = '0px';
        tooltip.style.top = target.offsetTop + target.offsetHeight + 10 + 'px';
        var bounding = tooltip.getBoundingClientRect();

        // Check if the tooltip is below the viewport
        if (bounding.bottom > (window.innerHeight || document.documentElement.clientHeight))
        {
            tooltip.style.top = '';
            tooltip.style.bottom = target.offsetTop + target.offsetHeight + 10 + 'px';
            tooltip.classList.add('top');
        }
        else
        {
            tooltip.classList.add('bottom');
        }

    } // End of the addTooltip method

    // Remove a tooltip
    function removeTooltip(target, tooltip)
    {
        if (tooltip !== null)
        {
            // Reset the title and remove the tooltip
            target.setAttribute('title', tooltip.innerHTML);
            tooltip.remove();
        }
        
    } // End of the removeTooltip method

})();