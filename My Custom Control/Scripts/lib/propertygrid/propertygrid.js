﻿/* jshint -W089 */
(function ($) {
    var OTHER_GROUP_NAME = 'Other';
    var GET_VALS_FUNC_KEY = 'pg.getValues';
    var pgIdSequence = 0;

    /**
	 * Generates the property grid
	 * @param {object} obj - The object whose properties we want to display
	 * @param {object} meta - A metadata object describing the obj properties
	 */
    $.fn.jqPropertyGrid = function (obj, meta) {
        // Check if the user called the 'get' function (to get the values back from the grid).
        if (typeof obj === 'string' && obj === 'get') {
            if (typeof this.data(GET_VALS_FUNC_KEY) === 'function') {
                return this.data(GET_VALS_FUNC_KEY)();
            }
            return null;
        } else if (typeof obj === 'string') {
            console.error('jqPropertyGrid got invalid option:', obj);
            return;
        } else if (typeof obj !== 'object' || obj === null) {
            console.error('jqPropertyGrid must get an object in order to initialize the grid.');
            return;
        }

        // Seems like we are ok to create the grid
        meta = meta && typeof meta === 'object' ? meta : {};
        var propertyRowsHTML = { OTHER_GROUP_NAME: '' };
        var groupsHeaderRowHTML = {};
        var postCreateInitFuncs = [];
        var getValueFuncs = {};
        var pgId = 'pg' + (pgIdSequence++);

        var currGroup;
        for (var prop in obj) {
            // Check what is the group of the current property or use the default 'Other' group
            currGroup = (meta[prop] && meta[prop].group) || OTHER_GROUP_NAME;

            // If this is the first time we run into this group create the group row
            if (currGroup !== OTHER_GROUP_NAME && !groupsHeaderRowHTML[currGroup]) {
                groupsHeaderRowHTML[currGroup] = getGroupHeaderRowHtml(currGroup);
            }

            // Initialize the group cells html
            propertyRowsHTML[currGroup] = propertyRowsHTML[currGroup] || '';

            // Append the current cell html into the group html
            propertyRowsHTML[currGroup] += getPropertyRowHtml(pgId, prop, obj[prop], meta[prop], postCreateInitFuncs, getValueFuncs);
        }

        // Now we have all the html we need, just assemble it
        var innerHTML = '<table class="pgTable">';
        for (var group in groupsHeaderRowHTML) {
            // Add the group row
           // innerHTML += groupsHeaderRowHTML[group];
            // Add the group cells
            innerHTML += propertyRowsHTML[group];
        }

        // Finally we add the 'Other' group
       // innerHTML += getGroupHeaderRowHtml(OTHER_GROUP_NAME);
        innerHTML += propertyRowsHTML[OTHER_GROUP_NAME];

        // Close the table and apply it to the div
        innerHTML += '</table>';
        this.html(innerHTML);

        // Call the post init functions
        for (var i = 0; i < postCreateInitFuncs.length; ++i) {
            if (typeof postCreateInitFuncs[i] === 'function') {
                postCreateInitFuncs[i]();
                // just in case make sure we are not holding any reference to the functions
                postCreateInitFuncs[i] = null;
            }
        }

        // Create a function that will return tha values back from the property grid
        var getValues = function () {
            var result = {};
            for (var prop in getValueFuncs) {
                if (typeof getValueFuncs[prop] !== 'function') { continue; }
                result[prop] = getValueFuncs[prop]();
            }

            return result;
        };

        this.data(GET_VALS_FUNC_KEY, getValues);
    };

    /**
	 * Gets the html of a group header row
	 * @param {string} displayName - The group display name
	 */
    function getGroupHeaderRowHtml(displayName) {
        return '<tr class="pgGroupRow"><td colspan="2" class="pgGroupCell">' + displayName + '</td></tr>';
    }

    /**
	 * Gets the html of a specific property row
	 * @param {string} pgId - The property-grid id being rendered
	 * @param {string} name - The property name
	 * @param {*} value - The current property value
	 * @param {object} meta - A metadata object describing this property
	 * @param {function[]} [postCreateInitFuncs] - An array to fill with functions to run after the grid was created
	 * @param {object.<string, function>} [getValueFuncs] - A dictionary where the key is the property name and the value is a function to retrieve the propery selected value
	 */
    function getPropertyRowHtml(pgId, name, value, meta, postCreateInitFuncs, getValueFuncs) {
        if (!name) { return ''; }
        meta = meta || {};
        // We use the name in the meta if available
        var displayName = meta.name || name;
        var type = meta.type || '';
        var elemId = pgId + name;

        var valueHTML;

        // If boolean create checkbox
        if (type === 'boolean' || (type === '' && typeof value === 'boolean')) {
            valueHTML = '<input type="checkbox" id="' + elemId + '" value="' + name + '"' + (value ? ' checked' : '') + ' />';
            if (getValueFuncs) { getValueFuncs[name] = function () { return $('#' + elemId).prop('checked'); }; }

            // If options create drop-down list
        } else if (type === 'options') {
            valueHTML = getSelectOptionHtml(elemId, value, meta.options);
            if (getValueFuncs) { getValueFuncs[name] = function () { return $('#' + elemId).val(); }; }

            // If number and a jqueryUI spinner is loaded use it
        } else if (type === 'number' && typeof $.fn.spinner === 'function') {
            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '" style="width:50px" />';
            if (postCreateInitFuncs) { postCreateInitFuncs.push(initSpinner(elemId, meta.options)); }
            if (getValueFuncs) { getValueFuncs[name] = function () { return $('#' + elemId).spinner('value'); }; }

            // If color and we have the spectrum color picker use it
        } else if (type === 'color' && typeof $.fn.spectrum === 'function') {
            valueHTML = '<input type="text" id="' + elemId + '" />';
            if (postCreateInitFuncs) { postCreateInitFuncs.push(initColorPicker(elemId, value, meta.options)); }
            if (getValueFuncs) { getValueFuncs[name] = function () { return $('#' + elemId).spectrum('get').toHexString(); }; }

            // Default is textbox
        } else {
            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"</input>';
            if (getValueFuncs) { getValueFuncs[name] = function () { return $('#' + elemId).val(); }; }
        }

        return '<tr class="pgRow"><td class="pgCell">' + displayName + '</td><td class="pgCell">' + valueHTML + '</td></tr>';
    }

    /**
	 * Gets a select-option (dropdown) html
	 * @param {string} id - The select element id
	 * @param {string} [selectedValue] - The current selected value
	 * @param {*[]} options - An array of option. An element can be an object with value/text pairs, or just a string which is both the value and text
	 * @returns {string} The select element html
	 */
    function getSelectOptionHtml(id, selectedValue, options) {
        id = id || '';
        selectedValue = selectedValue || '';
        options = options || [];

        var html = '<select';
        if (id) { html += ' id="' + id + '"'; }
        html += '>';

        var text, value;
        for (var i = 0; i < options.length; i++) {
            value = typeof options[i] === 'object' ? options[i].value : options[i];
            text = typeof options[i] === 'object' ? options[i].text : options[i];

            html += '<option value="' + value + '"' + (selectedValue === value ? ' selected>' : '>');
            html += text + '</option>';
        }

        html += '</select>';
        return html;
    }

    /**
	 * Gets an init function to a number textbox
	 * @param {string} id - The number textbox id
	 * @param {object} [options] - The spinner options
	 * @returns {function}
	 */
    function initSpinner(id, options) {
        if (!id) { return null; }
        // Copy the options so we won't change the user "copy"
        var opts = {};
        $.extend(opts, options);

        // Add a handler to the change event to verify the min/max (only if not provided by the user)
        opts.change = typeof opts.change === 'undefined' ? onSpinnerChange : opts.change;

        return function () {
            $('#' + id).spinner(opts);
        };
    }

    /**
	 * Gets an init function to a color textbox
	 * @param {string} id - The color textbox id
	 * @param {string} [color] - The current color (e.g #000000)
	 * @param {object} [options] - The color picker options
	 * @returns {function}
	 */
    function initColorPicker(id, color, options) {
        if (!id) { return null; }
        var opts = {};
        $.extend(opts, options);
        if (typeof color === 'string') { opts.color = color; }
        return function () {
            $('#' + id).spectrum(opts);
        };
    }

    /**
	 * Handler for the spinner change event
	 */
    function onSpinnerChange() {
        var min = $(this).spinner('option', 'min');
        var max = $(this).spinner('option', 'max');
        if (typeof min === 'number' && this.value < min) {
            this.value = min;
            return;
        }

        if (typeof max === 'number' && this.value > max) {
            this.value = max;
        }
    }
})(window.$);

//// This is our settings object
//var setObj = {
//    accumulateTicks: true,
//    filter: false,
//    filterSize: 200,
//    buyColor: '#00ff00',
//    sellColor: '#ff0000',
//    someOption: 'Maybe',
//    noGroup: 'I have no group'
//};

//// This is our settings object metadata
//var cpOptions = { preferredFormat: 'hex', showInput: true, showInitial: true };
//var metaObj = {
//    filter: { group: 'Behavior', name: 'Filter', type: 'boolean' },
//    filterSize: { group: 'Behavior', name: 'Filter size', type: 'number', options: { min: 0, max: 500, step: 10 } },
//    accumulateTicks: { group: 'Behavior', name: 'Accumulate ticks', type: 'boolean' },
//    buyColor: { group: 'Appearance', name: 'Buy color', type: 'color', options: cpOptions },
//    sellColor: { group: 'Appearance', name: 'Sell color', type: 'color', options: { preferredFormat: 'hex', showInput: true, showInitial: true } },
//    someOption: { name: 'Some option', type: 'options', options: ['Yes', 'No', { text: 'Not sure', value: 'Maybe' }] }
//};

//// Lets create the grid for it
//$('#propGrid').jqPropertyGrid(setObj, metaObj);

//// Now create another grid
//var theObj = {
//    font: 'Consolas',
//    fontSize: 14,
//    fontColor: '#a3ac03',
//    jQuery: true,
//    modernizr: false,
//    framework: 'angular',
//    iHaveNoMeta: 'Never mind...'
//};

//var theMeta = {
//    font: { group: 'Editor', name: 'Font' },
//    fontSize: { group: 'Editor', name: 'Font size', type: 'number', options: { min: 0, max: 20, step: 2 } },
//    fontColor: { group: 'Editor', name: 'Font color', type: 'color', options: { preferredFormat: 'hex' } },
//    jQuery: { group: 'Plugins' },
//    modernizr: { group: 'Plugins', type: 'boolean' },
//    framework: { name: 'Framework', group: 'Plugins', type: 'options', options: ['None', { text: 'AngularJS', value: 'angular' }, { text: 'Backbone.js', value: 'backbone' }] }
//};

//$('#propGrid2').jqPropertyGrid(theObj, theMeta);

//$('#btnGetValues').click(function () {
//    var first = JSON.stringify($('#propGrid').jqPropertyGrid('get'), null, '\t');
//    var second = JSON.stringify($('#propGrid2').jqPropertyGrid('get'), null, '\t');

//    $('#txtValues').val(first + '\n\n' + second);
//});