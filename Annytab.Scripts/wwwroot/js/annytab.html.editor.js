var annytab = annytab || {};
annytab.html = annytab.html || {};
annytab.html.editor = (function () {

    'use_strict';

    // Constructor
    function editor(opts)
    {
        // Set default values for parameters
        opts = opts || {};

        // Set options
        this.options = { button_container: 'htmlButtonPanel', textarea: 'txtContents', preview: 'txtPreview', button_class: 'annytab-form-button' };
        for (var option in this.options)
        {
            if (opts.hasOwnProperty(option) === true)
            {
                this.options[option] = opts[option];
            }
        }

        // Get references
        this.container = document.getElementById(this.options.button_container);
        this.ta = document.getElementById(this.options.textarea);
        this.pw = document.getElementById(this.options.preview);

        // Add buttons
        var html = '<input type="button" class="' + this.options.button_class + '" style="font-weight:bold;" value="b" />';
        html += '<input type="button" class="' + this.options.button_class + '" style="font-style:italic" value="i" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="br" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="h1" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="h2" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="h3" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="h4" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="p" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="code" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="span" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="div" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="line" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="space" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="url" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="img" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="font" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="list" />';
        html += '<input type="button" class="' + this.options.button_class + '" value="table" /><br />';
        html += '<div id="annytab-html-editor-preview" class="' + this.options.button_class + '">&#9738;</div>';
        html += '<div id="annytab-html-editor-minify" class="' + this.options.button_class + '">&#8722;</div>';
        html += '<div id="annytab-html-editor-unminify" class="' + this.options.button_class + '">&#43;</div>';

        // Add html to the container (fastest way)
        this.container.insertAdjacentHTML('beforeend', html);

        // Add events
        addEvents(this, this.container);

    } // End of the constructor

    // Toggle preview
    editor.prototype.togglePreview = function (button) {

        // Get buttons
        var buttons = this.container.querySelectorAll('input');

        // Check if the textarea is visible
        if (isVisible(this.ta) === true) {

            // Set preview window content
            this.pw.innerHTML = this.ta.value;

            // Set button text
            button.innerHTML = '<>';

            // Disable buttons
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].setAttribute('disabled', true);
            }

            // Display preview window
            this.ta.setAttribute('hidden', true);
            this.pw.removeAttribute('hidden');
        }
        else
        {
            // Set button text
            button.innerHTML = '&#9738;';

            // Enable buttons
            for (i = 0; i < buttons.length; i++)
            {
                buttons[i].removeAttribute('disabled');
            }

            // Display textarea
            this.ta.removeAttribute('hidden');
            this.pw.setAttribute('hidden', true);
        }

    }; // End of the togglePreview method

    // Minify html
    editor.prototype.minify = function () {

        // Remove tabs and line breaks
        this.ta.value = this.ta.value.replace(/(?!<pre[^>]*?>)([\t](?!@))(?![^<]*?<\/pre>)/g, '');
        this.ta.value = this.ta.value.replace(/(?!<pre[^>]*?>)([\r\n](?!@))(?![^<]*?<\/pre>)/g, '');
        this.ta.value = this.ta.value.replace(/(?!<pre[^>]*?>)([\r](?!@))(?![^<]*?<\/pre>)/g, '');
        this.ta.value = this.ta.value.replace(/(?!<pre[^>]*?>)([\n](?!@))(?![^<]*?<\/pre>)/g, '');

    }; // End of the minify method

    // Unminify html
    editor.prototype.unminify = function () {

        // Variables
        var step = 0;
        var content = '';

        // Get all nodes
        var nodes = this.ta.value.replace(/<\//g, '~~~</').replace(/</g, '~~~<').replace(/>/g, '>~~~').split('~~~');

        // Loop all nodes
        for (var i = 0; i < nodes.length; i++)
        {
            // Do not parse empty strings
            if (nodes[i] === '') {
                continue;
            }

            // Decrease step
            if (nodes[i].search(/<\/[^/>]+>/g) !== -1) // End tag
            {
                step -= 1;
            }

            // Append to content
            content += getTabs(step) + nodes[i] + '\n';

            // Increase step
            if (nodes[i].search(/<[^/>]+>/g) !== -1) // Start tag
            {
                step += 1;
            }
        }

        // Set unminified content
        this.ta.value = content;

    }; // End of the unminify method

    // Add a tag
    editor.prototype.addTag = function (button)
    {
        // Insert the tag
        if (button.value === "b") {
            surroundSelectedText(this.ta, '<b>', '</b>');
        }
        else if (button.value === "i") {
            surroundSelectedText(this.ta, '<i>', '</i>');
        }
        else if (button.value === "br") {
            insertText(this.ta, '<br />');
        }
        else if (button.value === "h1") {
            surroundSelectedText(this.ta, '<h1>', '</h1>');
        }
        else if (button.value === "h2") {
            surroundSelectedText(this.ta, '<h2>', '</h2>');
        }
        else if (button.value === "h3") {
            surroundSelectedText(this.ta, '<h3>', '</h3>');
        }
        else if (button.value === "h4") {
            surroundSelectedText(this.ta, '<h4>', '</h4>');
        }
        else if (button.value === "p") {
            surroundSelectedText(this.ta, '<p>', '</p>');
        }
        else if (button.value === "code") {
            surroundSelectedText(this.ta, '<pre class="prettyprint annytab-code-container">', '</pre>');
        }
        else if (button.value === "span") {
            surroundSelectedText(this.ta, '<span>', '</span>');
        }
        else if (button.value === "div") {
            surroundSelectedText(this.ta, '<div>', '</div>');
        }
        else if (button.value === "line") {
            surroundSelectedText(this.ta, '<div class="annytab-basic-line">', '</div>');
        }
        else if (button.value === "space") {
            surroundSelectedText(this.ta, '<div class="annytab-basic-space">', '</div>');
        }
        else if (button.value === "url") {
            surroundSelectedText(this.ta, '<a href="http://www.annytab.se" rel="nofollow" target="_blank">', '</a>');
        }
        else if (button.value === "img") {
            surroundSelectedText(this.ta, '<img src="/source.jpg" style="max-width:100%;" />', '');
        }
        else if (button.value === "font") {
            surroundSelectedText(this.ta, '<span style="font-family:Arial;color:#ff0000;">', '</span>');
        }
        else if (button.value === "list") {
            insertText(this.ta, '<ul><li>r1</li><li>r2</li></ul>');
        }
        else if (button.value === "table") {
            insertText(this.ta, '<table style="width:400px;text-align:center;"><tr><th>r1:c1</th><th>r1:c2</th></tr><tr><td>r2:c1</td><td>r2:c2</td></tr></table>');
        }

    }; // End of the addTag method

    // Add events
    function addEvents(ec, container)
    {
        // Get buttons
        var buttons = container.querySelectorAll('input');
        var pwb = container.querySelector('#annytab-html-editor-preview');
        var umb = container.querySelector('#annytab-html-editor-unminify');
        var mb = container.querySelector('#annytab-html-editor-minify');
        
        // Add toggle preview click event
        window.onload = pwb.addEventListener('click', function (event) {

            // Prevent default click behavior
            event.preventDefault();

            // Preview
            ec.togglePreview(this);

        }, false);

        // Add minify click event
        window.onload = mb.addEventListener('click', function (event) {

            // Prevent default click behavior
            event.preventDefault();

            // Minify html
            ec.minify();

        }, false);

        // Add unminify click event
        window.onload = umb.addEventListener('click', function (event) {

            // Prevent default click behavior
            event.preventDefault();

            // Unminify html
            ec.unminify();

        }, false);

        // Loop buttons
        for (var i = 0; i < buttons.length; i++)
        {
            // Add a click event
            window.onload = buttons[i].addEventListener('click', function (event) {

                // Prevent default click behavior
                event.preventDefault();

                // Add a tag
                ec.addTag(this);

            }, false);
        }

    } // End of the addEvents method

    // Get a selection
    function getSelection(el)
    {
        var start = el.selectionStart;
        var end = el.selectionEnd;

        return {
            start: start,
            end: end,
            length: end - start,
            text: el.value.slice(start, end)
        };

    } // End of the getSelection method

    // Surround selected text
    function surroundSelectedText(el, before, after)
    {
        // Get selection
        var selection = getSelection(el);

        // Replace text
        el.value = el.value.slice(0, selection.start) + before + selection.text + after + el.value.slice(selection.end);

        // Set cursor
        el.selectionEnd = selection.end + before.length + after.length;
        el.blur();
        el.focus();

    } // End of the surrondSelectedText method

    // Insert text at selection
    function insertText(el, text) {

        // Get selection
        var selection = getSelection(el);

        // Insert text
        el.value = el.value.slice(0, selection.start) + text + el.value.slice(selection.end);

        // Set cursor
        el.selectionEnd = selection.end + text.length;
        el.blur();
        el.focus();

    } // End of the insertText method

    // Check if an element is visible
    function isVisible(el)
    {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

    } // End of the isVisible method

    // Get tabs
    function getTabs(step) {

        var tabs = '';

        for (var i = 0; i < step; i++) {
            tabs += '\t';
        }

        return tabs;

    } // End of the getTabs method

    // Return this object
    return editor;

})();