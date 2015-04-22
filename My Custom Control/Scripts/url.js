var path = '';
var homeUrl = '';

$(document).ready(function () {

    var height = $(window).height() - 50;
    $('#content').height(height);

    var content = $('.ui-sortable');
    if (content != null) {
        if ($(content).length > 0) {
            $(content).height();
            $(content).css({ "height": "" });
        }
    }
});

String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); };

String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };

String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };

String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };


String.prototype.ltrim = function (char) {
    var reg = new RegExp('^' + char);
    return this.replace(reg, '');
};

function lookup(array, prop, value) {
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i][prop] === value) return array[i];
}

function lookupindex(array, prop, value) {
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i][prop] === value) return i;

    return -1;
}

//return match array
function lookuparray(array, prop, value) {
    var rows = [];

    for (var i = 0, len = array.length; i < len; i++)
        if (array[i][prop] === value)
            rows.push(array[i]);

    return rows;
}

function showPopup(title, content, prop) {

    prop = prop ? prop : {};

    prop.width = prop.width ? prop.width : 300;
    prop.height = prop.height ? prop.height : 300;
    prop.onclose = prop.onclose ? prop.onclose : function () { };

    var template = '<div class="popup-wrapper">' +
                    '<div class="popup">' +
                        '<div class="popup-head">' +
                            '<img src="../../Content/images/default.png" alt=""> ' + title +
                            '<a href="" class="popup-close close-btn">&times;</a></div>' +
                        '<div class="popup-content"></div>' +
                        '<div class="popup-foot">' +
                            '<a class="button">Save</a> ' +
                            '<a class="button close-btn">Cancel</a></div>' +
                        '</div>' +
                    '</div>';
    var popup = $(template);
    var close = popup.find('.close-btn');
    var popupwindow = popup.find('.popup');
    var popupcontent = popup.find('.popup-content');
    var popupfoot = popup.find('.popup-foot');
    var popuphead = popup.find('.popup-head');
    var cntlBtn = popup.find('.button').eq(0);

    if (typeof content == 'object') {
        popupcontent.append(content);
    }
    else {
        popupcontent.html(content);
    }

    popup.appendTo('body');

    popupwindow.draggable({
        containment: 'parent',
        handle: '.popup-head'
    });

    close.bind('click', function (e) {
        e.preventDefault();
        if (typeof prop.onclose == 'function')
            prop.onclose();
        $(this).parents('.popup-wrapper').remove();
    });

    popupwindow.width(prop.width);
    popupwindow.height(prop.height);

    $(window).resize(function () {
        var lc = $(window).width() / 2 - popupwindow.width() / 2;
        var tc = $(window).height() / 2 - popupwindow.height() / 2;

        popupwindow.css({ 'left': lc + 'px', top: tc + 'px' });
    }).resize();

    popupcontent.height(popupwindow.height() - popupfoot.height() - popuphead.height() - 66);

    return [popup[0], cntlBtn[0]];
}

var ID = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

