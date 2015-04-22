//drag directive
APP.directive('draggable', function ($document) {
    return function (scope, element, attrs) {
        var settings = eval('[' + attrs.draggable + ']')[0];
        $(element).draggable(settings).disableSelection();
    };
});

//drop directive
APP.directive('droppable', function ($document) {
    return function (scope, element, attrs) {
        var settings = eval('[' + attrs.droppable + ']')[0];
        $(element).droppable(settings).disableSelection();
    };
});

//sortable directive
APP.directive('sortable', function ($document) {
    return function (scope, element, attrs) {        
        $(element).sortable({
            helper: 'clone',
            cancel: '[contenteditable="true"], input, select, button',
            start: function (event, ui) {
                ui.item.data('start', ui.item.index());
            },
            update: $(element).is('.sortcontainer') ? scope.Rule.sortValueHandler : scope.Rule.sortHandler
        });
    };
});

//attach nicescroll to element
APP.directive('scrollable', function ($document) {
    return function (scope, element, attrs) {
        $(element).niceScroll({
            cursorborder: '#000',
            cursorcolor: '#048f99',
            cursorborderradius: '5px',
            cursorwidth: '5px',
            spacebarenabled: false,
            enablekeyboard: true,
            nativeparentscrolling: true
        });
    };
});

//Resizex
APP.directive('xresize', function ($document) {
    return function (scope, element, attrs) {
        $(window).resize(function () {
            var tW = 0;
            try {
                tW = +eval(attrs.xresize);
            } catch (e) {
                tW = 0;
            }
            $(element).width($(window).width() - (tW ? tW : 0));
        }).resize();
    };
});

APP.directive('yresize', function ($document) {
    return function (scope, element, attrs) {
        $(window).resize(function () {
            var tH = 0;
            try {
                tH = +eval(attrs.yresize);
            } catch (e) {
                tH = 0;
            }
            $(element).height($(window).height() - (tH ? tH : 0));
        }).resize();
    };
});

APP.directive('resizer', function ($document) {
    return function (scope, element, attrs) {
        var minWidth = +attrs.minwidth;
        minWidth = minWidth ? minWidth : 0;

        element.mousedown(function () {
            $(element).draggable('option', 'containment', [minWidth, 0, $(window).width() - minWidth, 0]);
        });

        element.draggable({
            axis: 'x',
            drag: function (event, ui) {
                var sW = $(window).width();
                var prev = $(this).prev();
                var next = $(this).next();
                var left = ui.position.left + 6;
                prev.outerWidth(left - 11);
                var width = sW - left - 14;
                next.css({
                    left: left + 'px'
                }).width(width);
                scope.NAVUtil.resetRowColumns();
                scope.NAVUtil.moveScroll();
            }
        });
    };
});

APP.directive('contenteditable', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            elm.click(function (e) {
                $(this).focus();
            });
            elm.bind('blur', function () {
                var value = $.trim(elm.text());
                scope.value = value;
                scope.$apply();
            });

            ctrl.$render = function () {
                elm.html(ctrl.$viewValue);
            };
        }
    };
});

function PopUpWindow(title, content, prop) {

    prop = prop ? prop : {};

    prop.width = prop.width ? prop.width : 300;
    prop.height = prop.height ? prop.height : 300;
    prop.onclose = prop.onclose ? prop.onclose : function () { };

    var template = '<div class="popup-wrapper">' +
                    '<div class="popup">' +
                        '<div class="popup-head">' +
                            '<img src="../../Content/images/default.png" alt=""> ' + title +
                            '<a href="" class="popup-close close-btn">&times;</a>'+
                        '</div>' +
                        '<div class="popup-content"></div>' +
                        '<div class="popup-foot">' +
                            '<input type="button" class="button" value="Save"> ' +
                            '<input type="button" class="button close-btn" value="Cancel">' +
                        '</div>' +
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
        popup.remove();
    });

    popupwindow.width(prop.width);
    popupwindow.height(prop.height);

    $(window).resize(function () {
        var lc = $(window).width() / 2 - popupwindow.width() / 2;
        var tc = $(window).height() / 2 - popupwindow.height() / 2;

        popupwindow.css({ 'left': lc + 'px', top: tc + 'px' });
    }).resize();

    popupcontent.height(popupwindow.height() - popupfoot.height() - popuphead.height() - 66);

    this.close = function () {

    };

    return {
        popup: popup,
        close: function () {
            popup.remove();
        },
        controls: [cntlBtn]
    };
}

function showAlert(msg, type) {
    var cls = "success";
    switch (type) {
        case 0:
            cls = 'error';
            break;
        case 1:
            cls = 'warning';
            break;
        case 2:
            cls = 'success';
            break;
    }
    $('<div/>').addClass('popalert').addClass(cls).html(msg).appendTo('body').slideToggle('slow');
    setTimeout(function () {
        $('.popalert').slideToggle('slow', function () {
            $(this).remove();
        });
    }, 3000);
}

var showLoader = function () {
    removeLoader();
    $('<div class="gif-loading"><div> </div></div>').appendTo('body');
};

var removeLoader = function () {
    $('.gif-loading').remove();
};