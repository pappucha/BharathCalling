'use strict';
(function ($, angular, window, undefined) {
    angular.module('glams.components.ui', ['glams.ui.tabs', 'glams.ui.collapsible', 'glams.ui.accordion', 'glams.ui.customSelect', 'glams.ui.checkboxradio', 'glams.ui.datepicker', 'glams.ui.modal', 'glams.ui.grids', 'glams.ui.upload', 'glams.ui.colorpicker', 'glams.ui.tree', 'glams.module.validation', 'glams.ui.checklistmodel', 'ngCkeditor']);

    /*
        UI Tabs
    */
    angular.module('glams.ui.tabs', [])

    .controller('TabsetController', ['$scope',
        function TabsetCtrl($scope) {
            var ctrl = this,
                tabs = ctrl.tabs = $scope.tabs = [];

            ctrl.select = function (selectedTab) {
                angular.forEach(tabs, function (tab) {
                    if (tab.active && tab !== selectedTab) {
                        tab.active = false;
                        tab.onDeselect();
                    }
                });
                selectedTab.active = true;
                selectedTab.onSelect();
            };

            ctrl.addTab = function addTab(tab) {
                tabs.push(tab);
                if (tabs.length === 1) {
                    tab.active = true;
                } else if (tab.active) {
                    ctrl.select(tab);
                }
            };

            ctrl.removeTab = function removeTab(tab) {
                var index = tabs.indexOf(tab);
                if (tab.active && tabs.length > 1) {
                    var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
                    ctrl.select(tabs[newActiveIndex]);
                }
                tabs.splice(index, 1);
            };
        }])

    .directive('tabset', function ($timeout) {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {

            },
            controller: 'TabsetController',
            template: ['<div>',
                            '<ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>',
                            '<div class="tab-content">',
                                '<div class="tab-pane" ng-repeat="tab in tabs" ng-class="{active: tab.active}" tab-content-transclude="tab"></div>',
                            '</div>',
                       '</div>'].join(''),
            link: function (scope, element, attrs) {
                scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
                if (scope.vertical) {
                    $timeout(function () {
                        $(element).find('.tab-content').css('minHeight', $(element).find('.nav-tabs').first().height() + 'px');
                    }, 100);
                }
                scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
            }
        };
    })

    .directive('tab', ['$parse',
        function ($parse) {
            return {
                require: '^tabset',
                restrict: 'EA',
                replace: true,
                template: ['<li ng-class="{active: active, disabled: disabled}">',
                                '<a ng-click="select()" tab-heading-transclude>{{heading}}</a>',
                           '</li>'].join(''),
                transclude: true,
                scope: {
                    heading: '@',
                    onSelect: '&select',

                    onDeselect: '&deselect'
                },
                controller: function ($scope) {

                },
                compile: function (elm, attrs, transclude) {
                    return function postLink(scope, elm, attrs, tabsetCtrl) {
                        scope.disabled = attrs.disabled ? true : false;
                        scope.active = attrs.active ? !!$parse(attrs.active)() : false;

                        scope.select = function () {
                            if (!scope.disabled) {
                                scope.active = true;
                            }
                        };

                        scope.$watch('active', function (active) {
                            if (active && !scope.disabled) {
                                tabsetCtrl.select(scope);
                            }
                        });

                        tabsetCtrl.addTab(scope);
                        scope.$on('$destroy', function () {
                            tabsetCtrl.removeTab(scope);
                        });

                        scope.$transcludeFn = transclude;
                    };
                }
            };
        }])

    .directive('tabHeadingTransclude', [

        function () {
            return {
                restrict: 'A',
                require: '^tab',
                link: function (scope, elm, attrs, tabCtrl) {
                    scope.$watch('headingElement', function updateHeadingElement(heading) {
                        if (heading) {
                            elm.html('');
                            elm.append(heading);
                        }
                    });
                }
            };
        }])

    .directive('tabContentTransclude', function () {
        return {
            restrict: 'A',
            require: '^tabset',
            link: function (scope, elm, attrs) {
                var tab = scope.$eval(attrs.tabContentTransclude);

                tab.$transcludeFn(tab.$parent, function (contents) {
                    angular.forEach(contents, function (node) {
                        if (isTabHeading(node)) {
                            tab.headingElement = node;
                        } else {
                            elm.append(node);
                        }
                    });
                });
            }
        };

        function isTabHeading(node) {
            return node.tagName && (
                node.hasAttribute('tab-heading') ||
                node.hasAttribute('data-tab-heading') ||
                node.tagName.toLowerCase() === 'tab-heading' ||
                node.tagName.toLowerCase() === 'data-tab-heading'
            );
        }
    });



    /*
        UI Collapsible Panel
    */

    angular.module('glams.ui.collapsible', [])

    .controller('CollapsibleController', ['$scope',
        function ($scope) {

        }])

    .directive('collapsiblePanel', function ($parse, $compile) {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                heading: '@',
                collapsed: '=?',
                iconClass: '@'
            },
            controller: 'CollapsibleController',
            template: ['<div class="collapsible">',
                            '<div class="collapsible-head">',
                                '<span class="icon {{iconClass}}"></span> ',
                                '<span class="collapsible-head-text">{{heading}}</span> ',
                                '<span class="collapsible-status-icon fa fa-{{collapsed?\'plus\':\'minus\'}}" ng-click="collapsed=!collapsed"></span>',
                            '</div>',
                            '<div class="collapsible-content clearfix" ng-transclude></div>',
                       '</div>'].join(''),
            link: function (scope, element, attrs) {

                scope.$watch('collapsed', function (collapsed) {
                    if (collapsed) {
                        $(element).find('.collapsible-content').slideUp(150, function () {
                            $(element).addClass('collapsed');
                        });
                    } else {
                        $(element).removeClass('collapsed');
                        $(element).find('.collapsible-content').slideDown(150);
                    }
                });
            }

        };
    });


    /*
        UI Accordion
    */
    angular.module('glams.ui.accordion', [])

    .directive('accordion', function ($timeout) {
        var template = '';
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                closeOthers: '=?'
            },
            controller: function ($scope, $element) {
                $scope.closeOthers = $scope.closeOthers == undefined ? true : $scope.closeOthers;
                $scope.accordionGroup = [];
                this.addAccordion = function (pane) {
                    $scope.accordionGroup.push(pane);
                };

                this.select = function (ag) {
                    if ($scope.closeOthers) {
                        this.closeAll(ag);
                        ag.collapsed = false;
                    } else {
                        ag.collapsed = !ag.collapsed;
                    }
                };

                this.closeAll = function (ag) {
                    $.each($scope.accordionGroup, function (i, a) {
                        if (a !== ag) {
                            a.collapsed = true;
                        }
                    });
                };
            },
            link: function (scope, element, attrs) {

            },
            template: '<div class="accordion" ng-transclude></div>',
            replace: true
        };
    })

    .directive('accordionGroup', function ($compile, $timeout) {
        var count = 0;
        return {
            require: '^accordion',
            restrict: 'EA',
            transclude: true,
            scope: {
                heading: '@',
                iconClass: '@'
            },
            template: ['<div class="accordion-group">',
                            '<div class="accordion-head" ng-click="select()"><span class="icon {{iconClass}}"></span><span class="accordion-head-text">{{heading}}</span></div>',
                            '<div class="accordion-content clearfix" ng-transclude></div>',
                       '</div>'].join(''),
            controller: function ($scope) {

            },
            link: function (scope, element, attrs, accordionCntrl) {

                accordionCntrl.addAccordion(scope);

                scope.active = !!attrs.active;
                scope.collapsed = true;

                if (scope.active) {
                    count++;
                    accordionCntrl.select(scope);
                } else if (count === 0) {
                    count++;
                    accordionCntrl.select(scope);
                }


                scope.select = function () {
                    accordionCntrl.select(scope);
                };

                scope.$watch('collapsed', function (collapsed) {
                    if (collapsed) {
                        $(element).find('.accordion-content').slideUp(150, function () {
                            $(element).addClass('collapsed');
                        });
                    } else {
                        $(element).removeClass('collapsed');
                        $(element).find('.accordion-content').slideDown(150);
                    }
                });
            },
            replace: true
        };
    });


    /*
        UI Select Box
    */

    //custom custom set value function for auto ui refresh
    $.fn.setVal = function (value) {
        var el = $(this);
        var x = (value === undefined) ? el.val() : el.val(value);
        el.refresh();
        return x;
    };

    $.fn.refresh = function () {
        return $(this).trigger('refresh:custom');
    }

    angular.module('glams.ui.customSelect', [])

    .directive('customSelect', function ($compile, $timeout) {
        var template = ['<div class="custom-select" ng-class="{disabled: disabled}" ng-click="toggle()" tabindex="0" ng-style="{width:width}">',
                            '<ul class="selected-list" ng-if="multiSelect" ng-if="selectedList.length>0">',
                                '<li tabindex="-1" ng-repeat="list in selectedList track by $index" value="{{list.value}}" ng-click="$event.stopPropagation()">',
                                    '{{list.text}} <span class="fa fa-times" ng-click="remove(list)" title="remove"></span>',
                                '</li>',
                            '</ul>',
                            '<span class="selected-list" ng-if="selectedList.length==0">&nbsp;</span>',
                            '<span class="selected-list" ng-if="!multiSelect && selectedList.length>0">&nbsp;{{selectedList[0].text}}</span>',
                            '<i class="ic fa fa-sort-desc"></i>',
                            '<div class="select-list" ng-show="active">',
                                '<input type="text" class="form-control" ng-focus="active" ng-click="$event.stopPropagation()" ng-model="filter"/>',
                                '<span class="fbtn fa fa-check-square-o" ng-click="selectAll($event)" ng-if="multiSelect" title="select all"></span>',
                                '<span class="fbtn fa fa-eraser clear" ng-click="clearSelection($event)" ng-if="multiSelect" title="clear" style="top:23px"></span>',
                                '<i class="fa fa-search"></i>',
                                '<div class="select-list-container">',
                                    '<ul>',
                                        '<li ng-repeat="l in lists | filter:filter" ng-click="select($event, l)" ng-class="{active:inSelection(l)}">&nbsp;{{l.text}}</li>',
                                    '</ul>',
                                '</div>',
                            '</div>',
                         '</div>'].join('');
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                viewData: '=ngModel',
                width: '@width',
                optionData: '=customSelect',
                change: '&ngChange',
                blur: '&ngBlur',
                disabled: '=?ngDisabled'
            },
            controller: function ($scope, $element) {

            },
            link: function (scope, element, attrs) {

            },
            compile: function (elm, attrs, transclude) {
                return function postLink(scope, elm, attrs, tabsetCtrl) {
                    scope.active = false;
                    scope.lists = [];
                    scope.selectedList = [];
                    scope.defaultValue = [];
                    scope.multiSelect = $(elm).attr('multiple') ? true : false;
                    //scope.disabled = $(elm).attr('disabled') ? true : false;

                    /* init */
                    /*$(_selectBoxValuesIEFix).each(function () {
                        var el = this;
                        if (elm.attr('__tmpguid__') == el.id) {
                            elm.val(el.value);
                        }
                    });*/


                    scope.update = function (value) {
                        scope.viewData = value;
                        $(elm).val(value);
                        //scope.$apply();
                        setTimeout(function () {
                            scope.$apply();
                            scope.change();
                            scope.blur();
                        }, 0);
                    };

                    scope.resetPosition = function () {
                        if (scope.active) {
                            var el = $(scope.sElm).find('.select-list');
                            $(scope.sElm).removeClass('showBottom');
                            $(scope.sElm).removeClass('showTop');
                            var ht = el.offset().top - $('main.content-area').offset().top + el.height(),
                                wd = el.parent().offset().left + el.width();
                            var tclass  = (ht > $('main.content-area').height())?'showTop':'showBottom',
                                lclass = wd>$(window).width()?'showRight':'showLeft';
                            
                            $(scope.sElm).addClass(tclass).addClass(lclass);
                        }
                    };

                    scope.getVal = function () {
                        var eVal = scope.viewData || $(elm).val();
                        if (eVal == null)
                            eVal = scope.multiSelect ? [] : "";

                        return eVal;
                    };


                    scope.hasValue = function (value) {
                        var eVal = scope.getVal();
                        if (typeof eVal == "string")
                            return eVal == value;
                        else {
                            var flag = false;
                            $.each(eVal, function (i, v) {
                                if (v == value)
                                    flag = true;
                            });
                            return flag;
                        }
                    };

                    scope.init = function () {
                        scope.populateListData();
                        //$(elm).val(scope.getVal());
                        //scope.viewData = scope.getVal();
                    };


                    scope.populateListData = function () {
                        var firstObj = {};

                        scope.selectedList.splice(0, scope.selectedList.length);
                        scope.defaultValue.splice(0, scope.defaultValue.length);
                        scope.lists.splice(0, scope.lists.length);
                        var cnt = 0;
                        $(elm).find('option').each(function (i, o) {
                            var value = $(o).attr('value');
                            var text = $(o).text();
                            if (text) {
                                var obj = {
                                    value: value != undefined ? value : text,
                                    text: text
                                };
                                if (cnt == 0) {
                                    firstObj = obj;
                                }
                                scope.lists.push(obj);
                                cnt++;
                            }
                        });
                        scope.setSelectedItem();
                    };

                    setTimeout(function () {
                        scope.init();
                        scope.$apply();
                    }, 10)
                    /*----------------*/

                    scope.setSelectedItem = function () {
                        var valueList = scope.getVal();
                        if (scope.multiSelect) {
                            var v = (valueList instanceof Array) ? valueList : [valueList];
                            $.each(v, function (i, vl) {
                                $.each(scope.lists, function (j, l) {
                                    if (vl == l.value) {
                                        scope.selectedList.push(l);
                                        scope.defaultValue.push(l);
                                    }
                                });
                            });
                        }
                        else {
                            var v = (valueList instanceof Array) ? valueList[0] : valueList;
                            $.each(scope.lists, function (j, l) {
                                if (v == l.value) {
                                    scope.selectedList.splice(0, scope.selectedList.length);
                                    scope.defaultValue.splice(0, scope.defaultValue.length);
                                    scope.selectedList.push(l);
                                    scope.defaultValue.push(l);
                                }
                            });
                        }
                    };

                    scope.toggle = function () {
                        if (!scope.disabled) {
                            if (!scope.active)
                                $(scope.sElm).find('.select-list').removeClass('ng-hide');

                            scope.active = !scope.active;
                            scope.filter = "";
                            setTimeout(scope.resetPosition, 50);
                        } else {
                            scope.active = false;
                        }
                        scope.populateListData();
                    };

                    scope.select = function (event, list) {
                        event.stopPropagation();
                        var index = $.inArray(list, scope.selectedList);
                        if (index == -1) {
                            if (!scope.multiSelect && scope.selectedList.length > 0)
                                scope.clearSelection(event);
                            scope.selectedList.push(list);
                        } else
                            scope.remove(list);
                        if (!scope.multiSelect)
                            scope.active = false;
                        scope.update(scope.getValue());
                    };

                    scope.resetToDefault = function (evt) {
                        evt.stopPropagation();
                        scope.clearSelection(evt);
                        $(scope.defaultValue).each(function () {
                            scope.selectedList.push(this);
                        });
                        scope.update(scope.getValue());
                    };

                    scope.selectAll = function (evt) {
                        evt.stopPropagation();
                        scope.clearSelection(evt);
                        $(scope.lists).each(function () {
                            scope.selectedList.push(this);
                        });
                        scope.update(scope.getValue());
                    };

                    scope.clearSelection = function (evt) {
                        evt.stopPropagation();
                        scope.selectedList.splice(0, scope.selectedList.length);
                        scope.viewData = [];
                        scope.update(scope.viewData);
                    };

                    scope.getValue = function () {
                        if (scope.selectedList.length == 1) {
                            return scope.selectedList[0].value;
                        }

                        var value = [];
                        $(scope.selectedList).each(function (i, v) {
                            value.push(v.value);
                        });
                        return value;
                    };

                    scope.remove = function (list) {
                        if (!scope.disabled) {
                            var index = $.inArray(list, scope.selectedList);
                            if (index >= 0 && ((!scope.multiSelect && scope.selectedList.length > 1) || scope.multiSelect)) {
                                scope.selectedList.splice(index, 1);
                            }
                            scope.update(scope.getValue());
                        }
                    };

                    scope.inSelection = function (list) {
                        var index = $.inArray(list, scope.selectedList);
                        if (index >= 0) {
                            if (!scope.multiSelect) {
                                scope.selectedList.splice(0, scope.selectedList.length);
                                scope.selectedList.push(list);
                            }
                            return true
                        }
                        return false;
                    };

                    scope.sElm = $compile(template)(scope)[0];
                    $(elm).hide();
                    if ($(elm).hasClass('no-fluid'))
                        $(scope.sElm).addClass('no-fluid');

                    $(elm).after(scope.sElm);

                    $(elm).on('refresh:custom', function () {
                        scope.init();
                        scope.$apply(function () {
                            scope.update(scope.getValue());
                        });
                    });

                    $(document).on('click', function (event) {
                        if ($(scope.sElm).find(event.target).length == 0 && event.target != scope.sElm) {
                            scope.active = false;
                            setTimeout(function () {
                                $(scope.sElm).find('.select-list').addClass('ng-hide');
                            }, 0);
                        };
                    });

                    $(scope.sElm).on('keydown', function (evt) {
                        if (evt.which === 27) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            scope.active = false;
                        } else if (evt.which === 40 && !scope.isOpen) {
                            scope.active = true;
                        }
                        scope.$apply();
                    });

                    $(window).on('resize', scope.resetPosition);
                    $('main.content-area').on('scroll', scope.resetPosition);


                    /* watcher */
                    /*scope.$watch('disabled', function (disabled) {
                        scope.disabled = disabled ? true : false;
                    });*/

                    scope.$watch('viewData', function (value) {
                        scope.init();
                        $timeout(function () {
                            scope.init();
                        });
                    });

                    scope.$watch('optionData', function (value) {
                        scope.populateListData();
                        $timeout(function () {
                            scope.init();
                        });
                    });

                }
            }
        };
    });


    /*
        UI Check box/ Radio Button
    */
    function CheckboxRadioDirective($timeout, $parse) {
        return {
            require: 'ngModel',
            scope: {
                viewValue: '=ngModel'
            },
            link: function ($scope, element, $attrs) {
                $scope.$watch('viewValue', function (v) {
                    $(element).ionCheckRadio();
                });

                return $timeout(function () {
                    var value;
                    value = $parse($attrs['ngValue'])($scope);
                    return $(element).ionCheckRadio().on('change', function (event) {
                        if ($(element).attr('type') === 'checkbox') {
                            $scope.$apply(function () {
                                return $scope.viewValue = event.target.checked;
                            });
                        }
                        if ($(element).attr('type') === 'radio') {
                            return $scope.$apply(function () {
                                return $scope.viewData = value;
                            });
                        }
                    });
                });
            }
        };
    }
    angular.module('glams.ui.checkboxradio', [])
        .directive('customCheckbox', CheckboxRadioDirective)
        .directive('customRadio', CheckboxRadioDirective);


    /*
        UI helpers - position
    */

    angular.module('ui.bootstrap.position', [])

    /**
     * A set of utility methods that can be use to retrieve position of DOM elements.
     * It is meant to be used where we need to absolute-position DOM elements in
     * relation to other, existing elements (this is the case for tooltips, popovers,
     * typeahead suggestions etc.).
     */
    .factory('$position', ['$document', '$window',
        function ($document, $window) {

            function getStyle(el, cssprop) {
                if (el.currentStyle) { //IE
                    return el.currentStyle[cssprop];
                } else if ($window.getComputedStyle) {
                    return $window.getComputedStyle(el)[cssprop];
                }
                // finally try and get inline style
                return el.style[cssprop];
            }

            /**
             * Checks if a given element is statically positioned
             * @param element - raw DOM element
             */
            function isStaticPositioned(element) {
                return (getStyle(element, 'position') || 'static') === 'static';
            }

            /**
             * returns the closest, non-statically positioned parentOffset of a given element
             * @param element
             */
            var parentOffsetEl = function (element) {
                var docDomEl = $document[0];
                var offsetParent = element.offsetParent || docDomEl;
                while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || docDomEl;
            };

            return {
                /**
                 * Provides read-only equivalent of jQuery's position function:
                 * http://api.jquery.com/position/
                 */
                position: function (element) {
                    var elBCR = this.offset(element);
                    var offsetParentBCR = {
                        top: 0,
                        left: 0
                    };
                    var offsetParentEl = parentOffsetEl(element[0]);
                    if (offsetParentEl != $document[0]) {
                        offsetParentBCR = this.offset(angular.element(offsetParentEl));
                        offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                        offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
                    }

                    var boundingClientRect = element[0].getBoundingClientRect();
                    return {
                        width: boundingClientRect.width || element.prop('offsetWidth'),
                        height: boundingClientRect.height || element.prop('offsetHeight'),
                        top: elBCR.top - offsetParentBCR.top,
                        left: elBCR.left - offsetParentBCR.left
                    };
                },

                /**
                 * Provides read-only equivalent of jQuery's offset function:
                 * http://api.jquery.com/offset/
                 */
                offset: function (element) {
                    var boundingClientRect = element[0].getBoundingClientRect();
                    return {
                        width: boundingClientRect.width || element.prop('offsetWidth'),
                        height: boundingClientRect.height || element.prop('offsetHeight'),
                        top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                        left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
                    };
                },

                /**
                 * Provides coordinates for the targetEl in relation to hostEl
                 */
                positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

                    var positionStrParts = positionStr.split('-');
                    var pos0 = positionStrParts[0],
                        pos1 = positionStrParts[1] || 'center';

                    var hostElPos,
                        targetElWidth,
                        targetElHeight,
                        targetElPos;

                    hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

                    targetElWidth = targetEl.prop('offsetWidth');
                    targetElHeight = targetEl.prop('offsetHeight');

                    var shiftWidth = {
                        center: function () {
                            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
                        },
                        left: function () {
                            return hostElPos.left;
                        },
                        right: function () {
                            return hostElPos.left + hostElPos.width;
                        }
                    };

                    var shiftHeight = {
                        center: function () {
                            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
                        },
                        top: function () {
                            return hostElPos.top;
                        },
                        bottom: function () {
                            return hostElPos.top + hostElPos.height;
                        }
                    };

                    switch (pos0) {
                        case 'right':
                            targetElPos = {
                                top: shiftHeight[pos1](),
                                left: shiftWidth[pos0]()
                            };
                            break;
                        case 'left':
                            targetElPos = {
                                top: shiftHeight[pos1](),
                                left: hostElPos.left - targetElWidth
                            };
                            break;
                        case 'bottom':
                            targetElPos = {
                                top: shiftHeight[pos0](),
                                left: shiftWidth[pos1]()
                            };
                            break;
                        default:
                            targetElPos = {
                                top: hostElPos.top - targetElHeight,
                                left: shiftWidth[pos1]()
                            };
                            break;
                    }

                    return targetElPos;
                }
            };
        }]);


    /*
        UI helpers - date parser
    */

    angular.module('ui.bootstrap.dateparser', [])

    .service('dateParser', ['$locale', 'orderByFilter',
        function ($locale, orderByFilter) {

            this.parsers = {};

            var formatCodeToRegex = {
                'yyyy': {
                    regex: '\\d{4}',
                    apply: function (value) {
                        this.year = +value;
                    }
                },
                'yy': {
                    regex: '\\d{2}',
                    apply: function (value) {
                        this.year = +value + 2000;
                    }
                },
                'y': {
                    regex: '\\d{1,4}',
                    apply: function (value) {
                        this.year = +value;
                    }
                },
                'MMMM': {
                    regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
                    apply: function (value) {
                        this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value);
                    }
                },
                'MMM': {
                    regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
                    apply: function (value) {
                        this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value);
                    }
                },
                'MM': {
                    regex: '0[1-9]|1[0-2]',
                    apply: function (value) {
                        this.month = value - 1;
                    }
                },
                'M': {
                    regex: '[1-9]|1[0-2]',
                    apply: function (value) {
                        this.month = value - 1;
                    }
                },
                'dd': {
                    regex: '[0-2][0-9]{1}|3[0-1]{1}',
                    apply: function (value) {
                        this.date = +value;
                    }
                },
                'd': {
                    regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
                    apply: function (value) {
                        this.date = +value;
                    }
                },
                'EEEE': {
                    regex: $locale.DATETIME_FORMATS.DAY.join('|')
                },
                'EEE': {
                    regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|')
                }
            };

            function createParser(format) {
                var map = [],
                    regex = format.split('');

                angular.forEach(formatCodeToRegex, function (data, code) {
                    var index = format.indexOf(code);

                    if (index > -1) {
                        format = format.split('');

                        regex[index] = '(' + data.regex + ')';
                        format[index] = '$'; // Custom symbol to define consumed part of format
                        for (var i = index + 1, n = index + code.length; i < n; i++) {
                            regex[i] = '';
                            format[i] = '$';
                        }
                        format = format.join('');

                        map.push({
                            index: index,
                            apply: data.apply
                        });
                    }
                });

                return {
                    regex: new RegExp('^' + regex.join('') + '$'),
                    map: orderByFilter(map, 'index')
                };
            }

            this.parse = function (input, format) {
                if (!angular.isString(input) || !format) {
                    return input;
                }

                format = $locale.DATETIME_FORMATS[format] || format;

                if (!this.parsers[format]) {
                    this.parsers[format] = createParser(format);
                }

                var parser = this.parsers[format],
                    regex = parser.regex,
                    map = parser.map,
                    results = input.match(regex);

                if (results && results.length) {
                    var fields = {
                        year: 1900,
                        month: 0,
                        date: 1,
                        hours: 0
                    },
                        dt;

                    for (var i = 1, n = results.length; i < n; i++) {
                        var mapper = map[i - 1];
                        if (mapper.apply) {
                            mapper.apply.call(fields, results[i]);
                        }
                    }

                    if (isValid(fields.year, fields.month, fields.date)) {
                        dt = new Date(fields.year, fields.month, fields.date, fields.hours);
                    }

                    return dt;
                }
            };

            // Check if date is valid for specific month (and year for February).
            // Month: 0 = Jan, 1 = Feb, etc
            function isValid(year, month, date) {
                if (month === 1 && date > 28) {
                    return date === 29 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
                }

                if (month === 3 || month === 5 || month === 8 || month === 10) {
                    return date < 31;
                }

                return true;
            }
        }]);


    /*
        UI DatePicker
    */

    angular.module('glams.ui.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])

    .constant('datepickerConfig', {
        formatDay: 'dd',
        formatMonth: 'MMMM',
        formatYear: 'yyyy',
        formatDayHeader: 'EEE',
        formatDayTitle: 'MMMM yyyy',
        formatMonthTitle: 'yyyy',
        datepickerMode: 'day',
        minMode: 'day',
        maxMode: 'year',
        showWeeks: false,
        startingDay: 0,
        yearRange: 20,
        minDate: null,
        maxDate: null
    })

    .controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig',
        function ($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
            var self = this,
                ngModelCtrl = {
                    $setViewValue: angular.noop
                }; // nullModelCtrl;

            // Modes chain
            this.modes = ['day', 'month', 'year'];

            // Configuration attributes
            angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
                   'minMode', 'maxMode', 'showWeeks', 'startingDay', 'yearRange'], function (key, index) {
                       self[key] = angular.isDefined($attrs[key]) ? (index < 8 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
                   });

            // Watchable date attributes
            angular.forEach(['minDate', 'maxDate'], function (key) {
                if ($attrs[key]) {
                    $scope.$parent.$watch($parse($attrs[key]), function (value) {
                        self[key] = value ? new Date(value) : null;
                        self.refreshView();
                    });
                } else {
                    self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
                }
            });

            $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
            $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
            this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date();

            $scope.isActive = function (dateObject) {
                if (self.compare(dateObject.date, self.activeDate) === 0) {
                    $scope.activeDateId = dateObject.uid;
                    return true;
                }
                return false;
            };

            this.init = function (ngModelCtrl_) {
                ngModelCtrl = ngModelCtrl_;

                ngModelCtrl.$render = function () {
                    self.render();
                };
            };

            this.render = function () {
                if (ngModelCtrl.$modelValue) {
                    var date = new Date(ngModelCtrl.$modelValue),
                        isValid = !isNaN(date);

                    if (isValid) {
                        this.activeDate = date;
                    } else {
                        $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                    }
                    ngModelCtrl.$setValidity('date', isValid);
                }
                this.refreshView();
            };

            this.refreshView = function () {
                if (this.element) {
                    this._refreshView();

                    var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
                    ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
                }
            };

            this.createDateObject = function (date, format) {
                var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
                return {
                    date: date,
                    label: dateFilter(date, format),
                    selected: model && this.compare(date, model) === 0,
                    disabled: this.isDisabled(date),
                    current: this.compare(date, new Date()) === 0
                };
            };

            this.isDisabled = function (date) {
                return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({
                    date: date,
                    mode: $scope.datepickerMode
                })));
            };

            // Split array into smaller arrays
            this.split = function (arr, size) {
                var arrays = [];
                while (arr.length > 0) {
                    arrays.push(arr.splice(0, size));
                }
                return arrays;
            };

            $scope.select = function (date) {
                if ($scope.datepickerMode === self.minMode) {
                    var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
                    dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    ngModelCtrl.$setViewValue(dt);
                    ngModelCtrl.$render();
                } else {
                    self.activeDate = date;
                    $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) - 1];
                }
            };

            $scope.move = function (direction) {
                var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
                    month = self.activeDate.getMonth() + direction * (self.step.months || 0);
                self.activeDate.setFullYear(year, month, 1);
                self.refreshView();
            };

            $scope.toggleMode = function (direction) {
                direction = direction || 1;

                if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
                    return;
                }

                $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) + direction];
            };

            // Key event mapper
            $scope.keys = {
                13: 'enter',
                32: 'space',
                33: 'pageup',
                34: 'pagedown',
                35: 'end',
                36: 'home',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
            };

            var focusElement = function () {
                $timeout(function () {
                    self.element[0].focus();
                }, 0, false);
            };

            // Listen for focus requests from popup directive
            $scope.$on('datepicker.focus', focusElement);

            $scope.keydown = function (evt) {
                var key = $scope.keys[evt.which];

                if (!key || evt.shiftKey || evt.altKey) {
                    return;
                }

                evt.preventDefault();
                evt.stopPropagation();

                if (key === 'enter' || key === 'space') {
                    if (self.isDisabled(self.activeDate)) {
                        return; // do nothing
                    }
                    $scope.select(self.activeDate);
                    focusElement();
                } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
                    $scope.toggleMode(key === 'up' ? 1 : -1);
                    focusElement();
                } else {
                    self.handleKeyDown(key, evt);
                    self.refreshView();
                }
            };
        }])

    .directive('datepicker', function () {
        return {
            restrict: 'EA',
            replace: true,
            template: ['<div ng-switch="datepickerMode" role="application" ng-keydown="keydown($event)" class="datepicker inline">',
                        '<daypicker ng-switch-when="day" tabindex="0"></daypicker>',
                        '<monthpicker ng-switch-when="month" tabindex="0"></monthpicker>',
                        '<yearpicker ng-switch-when="year" tabindex="0"></yearpicker>',
                        '</div>'].join(''),
            scope: {
                datepickerMode: '=?',
                dateDisabled: '&'
            },
            require: ['datepicker', '?^ngModel'],
            controller: 'DatepickerController',
            link: function (scope, element, attrs, ctrls) {
                var datepickerCtrl = ctrls[0],
                    ngModelCtrl = ctrls[1];

                if (ngModelCtrl) {
                    datepickerCtrl.init(ngModelCtrl);
                }
            }
        };
    })

    .directive('daypicker', ['dateFilter',
        function (dateFilter) {
            return {
                restrict: 'EA',
                replace: true,
                template: ['<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">',
                            '<thead>',
                                '<tr>',
                                  '<th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>',
                                  '<th colspan="{{5 + showWeeks}}"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="msel btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>',
                                  '<th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>',
                                '</tr>',
                                '<tr>',
                                  '<th ng-show="showWeeks" class="text-center"></th>',
                                  '<th ng-repeat="label in labels track by $index" class="text-center"><small aria-label="{{label.full}}">{{label.abbr}}</small></th>',
                                '</tr>',
                            '</thead>',
                            '<tbody>',
                                '<tr ng-repeat="row in rows track by $index">',
                                  '<td ng-show="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>',
                                  '<td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">',
                                    '<button type="button" style="width:100%;" class="btn btn-default btn-sm" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{dt.label}}</span></button>',
                                  '</td>',
                                '</tr>',
                            '</tbody>',
                            '</table>'].join(''),
                require: '^datepicker',
                link: function (scope, element, attrs, ctrl) {
                    scope.showWeeks = ctrl.showWeeks;

                    ctrl.step = {
                        months: 1
                    };
                    ctrl.element = element;

                    var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                    function getDaysInMonth(year, month) {
                        return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
                    }

                    function getDates(startDate, n) {
                        var dates = new Array(n),
                            current = new Date(startDate),
                            i = 0;
                        current.setHours(12); // Prevent repeated dates because of timezone bug
                        while (i < n) {
                            dates[i++] = new Date(current);
                            current.setDate(current.getDate() + 1);
                        }
                        return dates;
                    }

                    ctrl._refreshView = function () {
                        var year = ctrl.activeDate.getFullYear(),
                            month = ctrl.activeDate.getMonth(),
                            firstDayOfMonth = new Date(year, month, 1),
                            difference = ctrl.startingDay - firstDayOfMonth.getDay(),
                            numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
                            firstDate = new Date(firstDayOfMonth);

                        if (numDisplayedFromPreviousMonth > 0) {
                            firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
                        }

                        // 42 is the number of days on a six-month calendar
                        var days = getDates(firstDate, 42);
                        for (var i = 0; i < 42; i++) {
                            days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
                                secondary: days[i].getMonth() !== month,
                                uid: scope.uniqueId + '-' + i
                            });
                        }

                        scope.labels = new Array(7);
                        for (var j = 0; j < 7; j++) {
                            scope.labels[j] = {
                                abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
                                full: dateFilter(days[j].date, 'EEEE')
                            };
                        }

                        scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
                        scope.rows = ctrl.split(days, 7);

                        if (scope.showWeeks) {
                            scope.weekNumbers = [];
                            var weekNumber = getISO8601WeekNumber(scope.rows[0][0].date),
                                numWeeks = scope.rows.length;
                            while (scope.weekNumbers.push(weekNumber++) < numWeeks) { }
                        }
                    };

                    ctrl.compare = function (date1, date2) {
                        return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
                    };

                    function getISO8601WeekNumber(date) {
                        var checkDate = new Date(date);
                        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
                        var time = checkDate.getTime();
                        checkDate.setMonth(0); // Compare with Jan 1
                        checkDate.setDate(1);
                        return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
                    }

                    ctrl.handleKeyDown = function (key, evt) {
                        var date = ctrl.activeDate.getDate();

                        if (key === 'left') {
                            date = date - 1; // up
                        } else if (key === 'up') {
                            date = date - 7; // down
                        } else if (key === 'right') {
                            date = date + 1; // down
                        } else if (key === 'down') {
                            date = date + 7;
                        } else if (key === 'pageup' || key === 'pagedown') {
                            var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
                            ctrl.activeDate.setMonth(month, 1);
                            date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
                        } else if (key === 'home') {
                            date = 1;
                        } else if (key === 'end') {
                            date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
                        }
                        ctrl.activeDate.setDate(date);
                    };

                    ctrl.refreshView();
                }
            };
        }])

    .directive('monthpicker', ['dateFilter',
        function (dateFilter) {
            return {
                restrict: 'EA',
                replace: true,
                template: ['<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">',
                              '<thead>',
                                '<tr>',
                                  '<th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>',
                                  '<th><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="msel btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>',
                                  '<th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>',
                                '</tr>',
                              '</thead>',
                              '<tbody>',
                                '<tr ng-repeat="row in rows track by $index">',
                                  '<td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">',
                                    '<button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>',
                                  '</td>',
                                '</tr>',
                              '</tbody>',
                            '</table>'].join(''),
                require: '^datepicker',
                link: function (scope, element, attrs, ctrl) {
                    ctrl.step = {
                        years: 1
                    };
                    ctrl.element = element;

                    ctrl._refreshView = function () {
                        var months = new Array(12),
                            year = ctrl.activeDate.getFullYear();

                        for (var i = 0; i < 12; i++) {
                            months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
                                uid: scope.uniqueId + '-' + i
                            });
                        }

                        scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
                        scope.rows = ctrl.split(months, 3);
                    };

                    ctrl.compare = function (date1, date2) {
                        return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
                    };

                    ctrl.handleKeyDown = function (key, evt) {
                        var date = ctrl.activeDate.getMonth();

                        if (key === 'left') {
                            date = date - 1; // up
                        } else if (key === 'up') {
                            date = date - 3; // down
                        } else if (key === 'right') {
                            date = date + 1; // down
                        } else if (key === 'down') {
                            date = date + 3;
                        } else if (key === 'pageup' || key === 'pagedown') {
                            var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
                            ctrl.activeDate.setFullYear(year);
                        } else if (key === 'home') {
                            date = 0;
                        } else if (key === 'end') {
                            date = 11;
                        }
                        ctrl.activeDate.setMonth(date);
                    };

                    ctrl.refreshView();
                }
            };
        }])

    .directive('yearpicker', ['dateFilter',
        function (dateFilter) {
            return {
                restrict: 'EA',
                replace: true,
                template: ['<table role="grid" aria-labelledby="{{uniqueId}}-title" aria-activedescendant="{{activeDateId}}">',
                              '<thead>',
                                '<tr>',
                                  '<th><button type="button" class="btn btn-default btn-sm pull-left" ng-click="move(-1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-left"></i></button></th>',
                                  '<th colspan="3"><button id="{{uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="msel btn btn-default btn-sm" ng-click="toggleMode()" tabindex="-1" style="width:100%;"><strong>{{title}}</strong></button></th>',
                                  '<th><button type="button" class="btn btn-default btn-sm pull-right" ng-click="move(1)" tabindex="-1"><i class="glyphicon glyphicon-chevron-right"></i></button></th>',
                                '</tr>',
                              '</thead>',
                              '<tbody>',
                                '<tr ng-repeat="row in rows track by $index">',
                                  '<td ng-repeat="dt in row track by dt.date" class="text-center" role="gridcell" id="{{dt.uid}}" aria-disabled="{{!!dt.disabled}}">',
                                    '<button type="button" style="width:100%;" class="btn btn-default" ng-class="{\'btn-info\': dt.selected, active: isActive(dt)}" ng-click="select(dt.date)" ng-disabled="dt.disabled" tabindex="-1"><span ng-class="{\'text-info\': dt.current}">{{dt.label}}</span></button>',
                                  '</td>',
                                '</tr>',
                              '</tbody>',
                            '</table>'].join(''),
                require: '^datepicker',
                link: function (scope, element, attrs, ctrl) {
                    var range = ctrl.yearRange;

                    ctrl.step = {
                        years: range
                    };
                    ctrl.element = element;

                    function getStartingYear(year) {
                        return parseInt((year - 1) / range, 10) * range + 1;
                    }

                    ctrl._refreshView = function () {
                        var years = new Array(range);

                        for (var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()) ; i < range; i++) {
                            years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
                                uid: scope.uniqueId + '-' + i
                            });
                        }

                        scope.title = [years[0].label, years[range - 1].label].join(' - ');
                        scope.rows = ctrl.split(years, 5);
                    };

                    ctrl.compare = function (date1, date2) {
                        return date1.getFullYear() - date2.getFullYear();
                    };

                    ctrl.handleKeyDown = function (key, evt) {
                        var date = ctrl.activeDate.getFullYear();

                        if (key === 'left') {
                            date = date - 1; // up
                        } else if (key === 'up') {
                            date = date - 5; // down
                        } else if (key === 'right') {
                            date = date + 1; // down
                        } else if (key === 'down') {
                            date = date + 5;
                        } else if (key === 'pageup' || key === 'pagedown') {
                            date += (key === 'pageup' ? -1 : 1) * ctrl.step.years;
                        } else if (key === 'home') {
                            date = getStartingYear(ctrl.activeDate.getFullYear());
                        } else if (key === 'end') {
                            date = getStartingYear(ctrl.activeDate.getFullYear()) + range - 1;
                        }
                        ctrl.activeDate.setFullYear(date);
                    };

                    ctrl.refreshView();
                }
            };
        }])

    .constant('datepickerPopupConfig', {
        datepickerPopup: 'yyyy-MM-dd',
        currentText: 'Today',
        clearText: 'Clear',
        closeText: 'Done',
        closeOnDateSelection: true,
        appendToBody: false,
        showButtonBar: true
    })

    .directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig',
        function ($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
            return {
                restrict: 'EA',
                require: 'ngModel',
                scope: {
                    isOpen: '=?',
                    currentText: '@',
                    clearText: '@',
                    closeText: '@',
                    dateDisabled: '&'
                },
                link: function (scope, element, attrs, ngModel) {
                    scope.isOpen = false;
                    var dateFormat,
                        closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
                        appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

                    scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

                    scope.getText = function (key) {
                        return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
                    };

                    attrs.$observe('datepickerPopup', function (value) {
                        dateFormat = value || datepickerPopupConfig.datepickerPopup;
                        ngModel.$render();
                    });

                    // popup element used to display calendar
                    var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
                    popupEl.attr({
                        'ng-model': 'date',
                        'ng-change': 'dateSelection()'
                    });

                    function cameltoDash(string) {
                        return string.replace(/([A-Z])/g, function ($1) {
                            return '-' + $1.toLowerCase();
                        });
                    }

                    // datepicker element
                    var datepickerEl = angular.element(popupEl.children()[0]);
                    if (attrs.datepickerOptions) {
                        angular.forEach(scope.$parent.$eval(attrs.datepickerOptions), function (value, option) {
                            datepickerEl.attr(cameltoDash(option), value);
                        });
                    }

                    scope.watchData = {};
                    angular.forEach(['minDate', 'maxDate', 'datepickerMode'], function (key) {
                        if (attrs[key]) {
                            var getAttribute = $parse(attrs[key]);
                            scope.$parent.$watch(getAttribute, function (value) {
                                scope.watchData[key] = value;
                            });
                            datepickerEl.attr(cameltoDash(key), 'watchData.' + key);

                            // Propagate changes from datepicker to outside
                            if (key === 'datepickerMode') {
                                var setAttribute = getAttribute.assign;
                                scope.$watch('watchData.' + key, function (value, oldvalue) {
                                    if (value !== oldvalue) {
                                        setAttribute(scope.$parent, value);
                                    }
                                });
                            }
                        }
                    });
                    if (attrs.dateDisabled) {
                        datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
                    }

                    function parseDate(viewValue) {
                        if (!viewValue) {
                            ngModel.$setValidity('date', true);
                            return null;
                        } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                            ngModel.$setValidity('date', true);
                            return viewValue;
                        } else if (angular.isString(viewValue)) {
                            var date = dateParser.parse(viewValue, dateFormat) || new Date(viewValue);
                            if (isNaN(date)) {
                                ngModel.$setValidity('date', false);
                                return undefined;
                            } else {
                                ngModel.$setValidity('date', true);
                                return date;
                            }
                        } else {
                            ngModel.$setValidity('date', false);
                            return undefined;
                        }
                    }
                    ngModel.$parsers.unshift(parseDate);

                    // Inner change
                    scope.dateSelection = function (dt) {
                        if (angular.isDefined(dt)) {
                            scope.date = dt;
                        }
                        ngModel.$setViewValue(scope.date);
                        ngModel.$render();

                        if (closeOnDateSelection) {
                            scope.isOpen = false;
                            element[0].focus();
                        }
                    };

                    element.bind('input change keyup', function () {
                        scope.$apply(function () {
                            scope.date = ngModel.$modelValue;
                        });
                    });

                    // Outter change
                    ngModel.$render = function () {
                        var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
                        element.val(date);
                        scope.date = parseDate(ngModel.$modelValue);
                    };

                    var documentClickBind = function (event) {
                        if (scope.isOpen && event.target !== element[0]) {
                            scope.$apply(function () {
                                scope.isOpen = false;
                            });
                        }
                    };

                    var keydown = function (evt, noApply) {
                        scope.keydown(evt);
                    };
                    element.bind('keydown', keydown);

                    scope.keydown = function (evt) {
                        if (evt.which === 27) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            scope.close();
                        } else if (evt.which === 40 && !scope.isOpen) {
                            scope.isOpen = true;
                        }
                    };

                    scope.$watch('isOpen', function (value) {
                        if (value) {
                            scope.$broadcast('datepicker.focus');
                            scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                            scope.position.top = scope.position.top + element.prop('offsetHeight');

                            $document.bind('click', documentClickBind);
                        } else {
                            $document.unbind('click', documentClickBind);
                        }
                    });

                    scope.select = function (date) {
                        if (date === 'today') {
                            var today = new Date();
                            if (angular.isDate(ngModel.$modelValue)) {
                                date = new Date(ngModel.$modelValue);
                                date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
                            } else {
                                date = new Date(today.setHours(0, 0, 0, 0));
                            }
                        }
                        scope.dateSelection(date);
                    };

                    scope.close = function () {
                        scope.isOpen = false;
                        element[0].focus();
                    };

                    var $popup = $compile(popupEl)(scope);
                    if (appendToBody) {
                        $document.find('body').append($popup);
                    } else {
                        element.after($popup);
                    }

                    scope.$on('$destroy', function () {
                        $popup.remove();
                        element.unbind('keydown', keydown);
                        $document.unbind('click', documentClickBind);
                    });

                    element.bind('click', function (event) {
                        scope.isOpen = true;
                        scope.$apply();
                    });
                }
            };
        }])

    .directive('datepickerPopupWrap', function () {
        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            template: ['<ul class="datepicker dropdown-menu" ng-style="{display: (isOpen && \'block\') || \'none\', top: position.top+\'px\', left: position.left+\'px\'}" ng-keydown="keydown($event)">',
                        '<li ng-transclude></li>',
                        '<li ng-if="showButtonBar" class="button-bar">',
                            '<span class="btn-group">',
                                '<button type="button" class="btn btn-sm btn-info" ng-click="select(\'today\')">{{ getText(\'current\') }}</button>',
                                '<button type="button" class="btn btn-sm btn-danger" ng-click="select(null)">{{ getText(\'clear\') }}</button>',
                            '</span>',
                            '<button type="button" class="btn btn-sm btn-success pull-right" ng-click="close()">{{ getText(\'close\') }}</button>',
                        '</li>',
                    '</ul>'].join(''),
            link: function (scope, element, attrs) {
                element.bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });
            }
        };
    });

    /* 
        UI Modal 
    */
    angular.module('glams.ui.modal', [])
        .directive('modalPopup', function () {
            return {
                restrict: 'A',
                scope: {
                    modalPopup: '=modalPopup',
                    modalPopupOnclose: '&',
                    modalPopupTitle: '@'
                },
                link: function (scope, element, attrs) {
                    element.on('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var options = scope.modalPopup || {};
                        options.type = 'iframe';
                        $.modal(scope.modalPopupTitle || '', attrs.href, options).on('close', function (e) {
                            if (typeof scope.modalPopupOnclose == 'function') {
                                scope.modalPopupOnclose();
                            }
                        });
                    });
                }
            };
        })
        .directive('aside', function () {
            return {
                restrict: 'A',
                scope: {
                    aside: '=aside',
                    asideOnclose: '&',
                    asideTitle: '@',
                    asidePosition: '@'
                },
                link: function (scope, element, attrs) {
                    element.on('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var options = scope.aside || {};
                        options.position = scope.asidePosition || 'right';
                        options.type = 'iframe';
                        $.aside(scope.asideTitle || '', attrs.href, options).on('close', function (e) {
                            if (typeof scope.asideOnclose == 'function')
                                scope.asideOnclose();
                        });
                    });
                }
            };
        });

    /*
        UI Grid
    */
    angular.module('glams.ui.grids', ['ngSanitize'])
        .factory('CustomGridService', ['$q', '$http', function ($q, $http) {
            var CustomGridService = {};
            CustomGridService.loadDataSet = function (url, data, method, headers) {
                var dObj = $q.defer();
                $http({
                    url: url,
                    method: method || 'POST',
                    data: data,
                    headers: headers || ''
                }).success(function (data, status) {
                    dObj.resolve(data);
                }).error(function (data, status) {
                    dObj.reject({ data: data, status: status });
                });
                return dObj.promise;
            };
            CustomGridService.loadHierarchy = function (url, method, headers) {
                var dObj = $q.defer();
                $http({
                    url: url,
                    method: method || 'GET',
                    headers: headers || ''
                }).success(function (data, status) {
                    dObj.resolve(data);
                }).error(function (data, status) {
                    dObj.reject({ data: data, status: status });
                });
                return dObj.promise;
            };
            CustomGridService.loadFilter = function (url, data, method, headers) {
                var dObj = $q.defer();
                $http({
                    url: url,
                    params: data,
                    method: method || 'GET',
                    headers: headers || '',
                }).success(function (data, status) {
                    dObj.resolve(data);
                }).error(function (data, status) {
                    dObj.reject({ data: data, status: status });
                });
                return dObj.promise;
            };
            CustomGridService.saveFilter = function (url, data, method, headers) {
                var dObj = $q.defer();
                $http({
                    url: url,
                    method: method || 'GET',
                    headers: headers || '',
                    data: data
                }).success(function (data, status) {
                    dObj.resolve(data);
                }).error(function (data, status) {
                    dObj.reject({ data: data, status: status });
                });
                return dObj.promise;
            };
            CustomGridService.deleteFilter = function (url, data, method, headers) {
                var dObj = $q.defer();
                $http({
                    url: url,
                    method: method || 'GET',
                    headers: headers || '',
                    params: data
                }).success(function (data, status) {
                    dObj.resolve(data);
                }).error(function (data, status) {
                    dObj.reject({ data: data, status: status });
                });
                return dObj.promise;
            };
            return CustomGridService;
        }])
        .filter('groupBy', function () {
            return function (input, group) {
                var output = input;
                if (group) {
                    var _output = _.groupBy(input, group);
                    output = [];
                    for (o in _output) {
                        output.push({ groupName: o, value: _output[o] });
                    }
                }
                return output;
            };
        })
        .filter('groupfilter', function () {
            return function (input, search, limit, page, serverPaging) {
                var output = [];
                page = page || 0;
                search = search.toLowerCase() || "";
                output = _.filter(input, function (row) {
                    return row[0].toString().toLowerCase().indexOf(search) >= 0;
                });

                if (serverPaging)
                    return _.size(input) > limit && limit > 0 ? output.splice(0, limit) : output;

                return _.size(input) > limit && limit > 0 ? output.splice(page * limit, limit) : output;
            };
        })
        .filter('gridfilter', function () {
            return function (input, search, limit, page, serverPaging) {
                var output = [],
                    k;
                page = page || 0;
                search = search.toLowerCase() || "";
                var hasSearch = false;
                output = _.filter(input, function (row) {
                    hasSearch = false;
                    for (k in row) {
                        if (k != '_hierarchy' && row[k] && row[k].toString().toLowerCase().indexOf(search) >= 0) {
                            hasSearch = true;
                        }
                    }
                    return hasSearch;
                });

                if (serverPaging)
                    return _.size(input) > limit && limit > 0 ? output.splice(0, limit) : output;

                return _.size(input) > limit && limit > 0 ? output.splice(page * limit, limit) : output;
            };
        })
        .filter('columnFilter', function () {
            return function (input, columnFilters) {
                if (!columnFilters)
                    return input;

                var output = [],
                    k;
                var keys = _.keys(columnFilters);

                output = _.filter(input, function (row) {
                    var count = 0;
                    for (k in columnFilters) {
                        var s = $.trim(columnFilters[k]).toLowerCase();
                        if (!s)
                            count++;
                        else if (row[k].toString().toLowerCase().indexOf(s) >= 0 || row[k] == s)
                            count++;
                    }
                    return (count == keys.length);
                });
                return output;
            };
        })
        .directive('grid', ['CustomGridService', function (CustomGridService) {
            var gridTemplate = ['<div class="_grid-container">',
                        '<div class="_grid-loader" ng-if="grid.isLoading"><span><i class="fa fa-3x fa-refresh fa-spin"></i></span></div>',
                        '<div class="row _grid-control" ng-show="showTools">',
                            '<div class="col-md-6">',
                                '<div ng-if="pagination.showPaging">Page Size <input size="1" maxlength="3" type="text" class="_showperpage form-control" ng-model="pagination.pageSize"/> ',
                                    ' <a ng-if="filter.showFilter" title="Column Filter" class="btn gbtn-default filter-btn" ng-class="{active:filter.columnFilterActive}" ng-click="filter.columnFilterActive=!filter.columnFilterActive"><i class="fa fa-filter"></i></a>',
                                    ' <a ng-if="filter.showFilterExpression" class="btn gbtn-default filter-btn" ng-class="{active:filter.filterExpressionActive}" ng-click="filter.filterExpressionActive=!filter.filterExpressionActive"><i class="fa fa-lg fa-code"></i>   <i class="fa fa-filter"></i></a>',
                                    ' <span class="btn-group filter-select" ng-show="filter.filterList.length>1 && filter.showFilterExpression">',
                                        '<span class="btn gbtn-default filter-btn"><i class="fa fa-filter"></i></span>',
                                        '<span class="btn gbtn-default filter-btn fselect">',
                                            '<select ng-options="f.ID as f.Name for f in filter.filterList" ng-model="filter.currentFilterExpression" ng-change="filter.loadExpression($event)">',
                                            '</select>',
                                        '</span>',
                                        '<span class="btn gbtn-default filter-btn" ng-click="filter.editExpression()"><i class="fa fa-pencil"></i></span>',
                                        '<span class="btn gbtn-default filter-btn" ng-click="filter.deleteExpression()"><i class="fa fa-trash"></i></span>',
                                    '</span>',
                                '</div>',
                            '</div>',
                            '<div class="col-md-6 text-right">',
                                ' <span ng-show="showGroupBy&&!grid.hierarchy">',
                                    ' <span class="btn-group filter-select" title="Group by column value">',
                                        '<span class="btn gbtn-default filter-btn"><i class="fa fa-th-large"></i></span>',
                                        '<span class="btn gbtn-default filter-btn fselect">',
                                            '<select ng-options="col.value as col.name for col in grid.columns" ng-model="groupBy"><option value=""> </option></select>',
                                        '</span>',
                                    '</span>',
                                '</span>',
                                ' <input size="50" type="text" class="_search form-control" ng-model="filter.search"/>',
                            '</div>',
                        '</div>',
                        '<div class="_grid-box" ng-include="groupBy?\'gridGroup.html\':\'gridDefault.html\'"></div>',
                    '</div>'].join('');

            return {
                restrict: 'EA',
                replace: true,
                transclude: false,
                scope: {
                    currentGridObj: '=?object',
                    gridOptions: '=config',
                    model: "=?ngModel",
                },
                template: gridTemplate,
                link: function (scope, element, attrs) {
                    //$(element).bind('mousedown', function (e) {
                    //    e.preventDefault();
                    //});

                    $(element).bind('contextmenu', function (e) {
                        e.preventDefault();
                    });
                },
                controller: function ($scope) {
                    $scope.templatePath = path + 'Scripts/lib/ui-templates/';
                    $scope.pagination = {
                        showPaging: false,
                        pageSize: 0,
                        currentPage: 0,
                        lastPage: 0,
                        pages: [0],
                        totalRecords: 0,
                        init: function () {
                            //set page size
                            $scope.pagination.showPaging && ($scope.pagination.pageSize = $scope.gridOptions.pageSize || 10);
                            $scope.pagination.update();
                            $scope.pagination.currentPage = 0;
                        },
                        update: function () {
                            var rowLength = $scope.grid.rows ? $scope.grid.rows.length : 0;
                            var rowLength = $scope.grid.rows ? $scope.grid.rows.length : 0;
                            var total = 0;
                            if ($scope.grid.serverPaging) {
                                $scope.pagination.totalRecords = $scope.pagination.totalRecords || ($scope.gridOptions.totalRecords || rowLength);
                            }
                            else {
                                $scope.pagination.totalRecords = rowLength;
                            }
                            total = $scope.pagination.totalRecords;

                            $scope.pagination.pageSize = $scope.pagination.pageSize || 10;
                            if ($scope.pagination.pageSize > 0) {
                                $scope.pagination.pages = _.range(Math.ceil(total / $scope.pagination.pageSize));
                                _.map($scope.pagination.pages, function (p) {
                                    return p + 1;
                                });
                            }
                            else {
                                $scope.pagination.pages = [1];
                            }
                            $scope.pagination.lastPage = $scope.pagination.pages[$scope.pagination.pages.length - 1];
                        },
                        setCurrentPage: function (page) {
                            if (page < $scope.pagination.pages.length && page >= 0 && page != $scope.pagination.currentPage) {
                                $scope.pagination.currentPage = page;
                                $scope.model = [];
                                $scope.grid.serverPaging && $scope.grid.loadDataSet();
                            }
                        },
                        getPages: function () {
                            var pages = [];
                            if (($scope.pagination.lastPage - $scope.pagination.currentPage) >= 10)
                                pages = _.clone($scope.pagination.pages).splice($scope.pagination.currentPage, 10);
                            else {
                                var sIndex = $scope.pagination.currentPage + 1 - 10;
                                pages = _.clone($scope.pagination.pages).splice((sIndex >= 0 ? sIndex : 0), 10);
                            }
                            return pages;
                        }
                    };


                    $scope.initLoad = true;

                    $scope.grid = {
                        resultSet: [],
                        isLoading: false,
                        serverPaging: false,
                        hierarchy: false,
                        columns: [],
                        rows: [],
                        groupArray: [],
                        showGrouping: false,
                        actions: [],
                        rowActions: [],
                        groupActions: [],
                        generateColumns: function () {
                            if ($scope.gridOptions.columns && $scope.gridOptions.columns.length) {
                                $scope.grid.columns = [];
                                $.each($scope.gridOptions.columns, function (i, c) {
                                    var obj = {};
                                    obj.name = c.name || c.value;
                                    obj.value = c.value || c.name;
                                    obj.type = c.type || "";
                                    obj.url = c.url || "";
                                    obj.style = c.style || {};
                                    obj.modalProperties = c.modalProperties || {};
                                    obj.asideProperties = c.asideProperties || {};
                                    obj.modalTitle = c.modalTitle || "";
                                    obj.asideTitle = c.asideTitle || "";
                                    obj.dataType = c.dataType || '';
                                    obj.Visible = c.Visible == false ? c.Visible : true,
                                    $scope.grid.columns.push(obj);
                                    $scope.filter.columns[obj.value] = '';
                                });
                            }
                            else if ($scope.grid.rows && $scope.grid.rows.length) {
                                $scope.grid.columns = [];
                                for (var k in $scope.grid.rows[0]) {
                                    if (k !== '_hierarchy' && k !== '$$hactive' && k != '_rowColor' && k != '$$hashKey') {
                                        var obj = {};
                                        obj.name = k;
                                        obj.value = k;
                                        obj.type = "";
                                        $scope.grid.columns.push(obj);
                                        $scope.filter.columns[obj.value] = '';
                                    }
                                }
                            }

                            return $scope.grid.columns;
                        },
                        getUniqueColumnValues: function (col) {
                            return _.uniq(_.map($scope.grid.rows, _.iteratee(col.value)));
                        },
                        getURL: function (url, r) {
                            if (r)
                                return url.replace(/\[(.*?)\]/g, function (a, b) {
                                    return r[b];
                                });
                        },
                        selectRow: function (row) {
                            if (!($scope.model instanceof Array))
                                $scope.model = [];

                            var index = $scope.grid.inSelection(row);

                            if (index < 0) {
                                if (!$scope.gridOptions.multiSelect)
                                    $scope.model = [];

                                $scope.model.push(row);
                            }
                            else
                                $scope.model.splice(index, 1);
                        },
                        inSelection: function (row) {
                            return $.inArray(row, $scope.model);
                        },
                        refresh: function () {
                            $scope.grid.rows = $scope.gridOptions.rows;
                            $scope.grid.generateColumns();
                            $scope.pagination.update();
                            $scope.grid.initActions();
                            if ($scope.groupBy)
                                $scope.setGroup($scope.groupBy);
                        },
                        loadDataSet: function () {
                            $scope.grid.isLoading = true;

                            var defaultData = { pagingEnabled: $scope.grid.serverPaging, pageSize: $scope.pagination.pageSize, pageIndex: $scope.pagination.currentPage };

                            $scope.grid.extendedObject.filterExp = $scope.filter.buildQuery();

                            var data = $.extend(true, $scope.grid.extendedObject, defaultData);
                            CustomGridService.loadDataSet($scope.gridOptions.dataUrl, data, $scope.method, $scope.headers).then(function (data) {
                                $scope.gridOptions.rows = data.rows || [];
                                $scope.pagination.totalRecords = data.totalRecords;
                                $scope.grid.isLoading = false;
                                $scope.initLoad = false;                                
                            }, function (data) {
                                $scope.grid.isLoading = false;
                                console.error('unable to retrive data');
                            });
                        },
                        loadHierarchy: function (row) {
                            row.$$hactive = !row.$$hactive;

                            if ($scope.grid.serverPaging && row._hierarchy)
                                row._hierarchy.rows = [];

                            if (!row.$$hactive || !$scope.grid.hierarchy)
                                return false;

                            if ($scope.gridOptions.hierarchyUrl) {
                                $scope.grid.isLoading = true;
                                CustomGridService.loadHierarchy($scope.grid.getURL($scope.gridOptions.hierarchyUrl, row), $scope.method, $scope.headers).then(function (config) {
                                    row._hierarchy = config;
                                    config.headers = $scope.headers;
                                    config.extendedObject = config.extendedObject || {};
                                    config.extendedObject.parentID = row.JobID || 0;
                                    config.showTools = false;
                                    $scope.initLoad = false;
                                    $scope.grid.isLoading = false;
                                });
                            }
                        },
                        initActions: function () {
                            $scope.grid.actions = $scope.gridOptions.actions || [];
                            $scope.grid.groupActions = [];
                            $scope.grid.rowActions = [];

                            $.each($scope.grid.actions, function (i, action) {
                                action.isGeneralAction = !!action.isGeneralAction;
                                if (!action.isGeneralAction)
                                    $scope.grid.rowActions.push(action);
                                else
                                    $scope.grid.groupActions.push(action);
                            });
                        },
                        init: function () {
                            if ($scope.gridOptions) {
                                $scope.method = $scope.gridOptions.method;
                                $scope.headers = $scope.gridOptions.headers;

                                $scope.groupBy = $scope.gridOptions.groupBy;
                                $scope.actionRef = $scope.gridOptions.actionReference;
                                $scope.showTools = $scope.gridOptions.showTools === false ? false : true;
                                $scope.showGroupBy = $scope.gridOptions.showGroupBy === false ? false : true;
                                $scope.showHeaders = $scope.gridOptions.showHeaders === false ? false : true;

                                $scope.filter.showFilter = $scope.gridOptions.filter == false ? false : true;
                                $scope.filter.showFilterExpression = $scope.gridOptions.showFilterExpression || false;

                                $scope.grid.extendedObject = $scope.gridOptions.extendedObject || {};
                                $scope.grid.showGrouping = $scope.gridOptions.showGrouping || false;
                                $scope.grid.serverPaging = $scope.gridOptions.serverPaging || false;
                                $scope.grid.hierarchy = $scope.gridOptions.hierarchy || false;

                                $scope.pagination.pageSize = $scope.gridOptions.pageSize || 10;
                                $scope.pagination.showPaging = $scope.gridOptions.showPaging === false ? false : true;

                                $scope.grid.rows = [];

                                $scope.grid.initActions();                           

                                if ($scope.grid.serverPaging || $scope.gridOptions.dataUrl) {
                                    if ($scope.filter.showFilterExpression)
                                        $scope.filter.init();
                                    else {
                                        $scope.grid.loadDataSet();
                                    }
                                }
                                else {
                                    $scope.grid.rows = $scope.gridOptions.rows || [];
                                }
                                //$scope.filter.init();
                            }
                        },
                        actionHandler: function ($event, isGeneralAction, actionName, row) {
                            if (typeof actionName == 'function') {
                                actionName($event, isGeneralAction ? $scope.model : [row], $scope);
                            }
                            else {
                                var action = $scope.actionRef[actionName];
                                if (typeof action == 'function')
                                    action($event, isGeneralAction ? $scope.model : [row], $scope);
                            }
                        }
                    };

                    $scope.currentGridObj = {
                        reload: $scope.grid.init,
                        refresh: $scope.grid.refresh,
                        grid: $scope.grid
                    };

                    $scope.groupArray = [];

                    $scope.setGroup = function (group) {

                        var _output = _.groupBy($scope.grid.rows, group);
                        var output = [],
                            o;
                        for (o in _output) {
                            output.push([o, _output[o], false]);
                        }
                        $scope.grid.groupArray = output;
                    };


                    $scope.sort = {
                        column: "",
                        reverse: false,
                        predicate: function (row) {
                            return row[$scope.sort.column];
                        }
                    };



                    $scope.filter = {
                        search: '',
                        showFilter: true,
                        showFilterExpression: false,
                        columnFilterActive: false,
                        filterExpressionActive: false,
                        currentFilterExpression: 0,
                        filterExpression: [],
                        filterList: [{ ID: 0 }],
                        setAsDefault: false,
                        columns: {
                        },
                        getDataType: function (colValue) {
                            var dType = '';
                            $.each($scope.grid.columns, function (i, col) {
                                if (col.value == colValue) {
                                    dType = col.dataType || '';
                                }
                            });
                            return dType;
                        },
                        columnChange: function (exp) {
                            exp.dataType = $scope.filter.getDataType(exp.column);
                            exp.value = '';
                        },
                        addChild: function (index, exp) {
                            var obj = {
                                boolean: '',
                                column: '',
                                operator: '',
                                dataType: '',
                                value1: '',
                                value2: '',
                                parent: exp || $scope.filter.filterExpression,
                                children: []
                            };

                            obj.parent.splice(index + 1, 0, obj);
                        },
                        deleteChild: function (exp) {
                            var index = $.inArray(exp, exp.parent);
                            (index >= 0) && exp.parent.splice(index, 1);
                        },
                        editExpression: function () {
                            if ($scope.filter.currentFilterExpression > 0)
                                $scope.filter.filterExpressionActive = true;
                            else
                                $scope.filter.filterExpression = [];
                        },
                        deleteExpression: function () {
                            var data = { id: $scope.filter.currentFilterExpression };
                            CustomGridService.deleteFilter(path + 'api/grid/DeleteGridFilter', data, 'POST', $scope.headers).then(function () {
                                $scope.filter.init();
                            });
                        },
                        buildQuery: function () {
                            var queryString = '';

                            function iterate(e) {
                                var str = '';
                                if (e.column) {
                                    str = ' ' + e.boolean + ' ([' + e.column + '] ';

                                    switch (e.operator) {
                                        case 'Between':
                                            str = str + ' >= \'' + e.value1 + '\' ' + 'AND ' + str.replace('(', '') + ' <= \'' + e.value2 + '\'';
                                            break;
                                        case 'NotBetween':
                                            str = str + ' < \'' + e.value1 + '\' ' + 'OR ' + str.replace('(', '') + ' > \'' + e.value2 + '\'';
                                            break;
                                        case 'IsNull':
                                            str = ' ' + e.boolean + ' ([' + e.column + '] ' + 'IS NULL';
                                            break;
                                        case 'IsNotNull':
                                            str = ' ' + e.boolean + ' ([' + e.column + '] ' + 'IS NOT NULL';
                                            break;
                                        case 'EqualTo':
                                            str = ' ' + e.boolean + ' ([' + e.column + '] = \'' + e.value1 + '\'';
                                            break;
                                        case 'NotEqualTo':
                                            str = ' ' + e.boolean + ' ([' + e.column + '] <> \'' + e.value1 + '\'';
                                            break;
                                        case 'Like':
                                            str = ' ' + e.boolean + ' ([' + e.column + '] LIKE \'%' + e.value1 + '%\'';
                                            break;
                                            /*case 'GreaterThan':
                                                str = ' ' + e.boolean + ' ([' + e.column + '] > ' + e.value1;
                                                break;
                                            case 'GreaterThanOrEqualTo':
                                                str = ' ' + e.boolean + ' ([' + e.column + '] >= ' + e.value1;
                                                break;
                                            case 'LessThan':
                                                str = ' ' + e.boolean + ' ([' + e.column + '] < ' + e.value1;
                                                break;
                                            case 'LessThanOrEqualTo':
                                                str = ' ' + e.boolean + ' ([' + e.column + '] <= ' + e.value1;
                                                break;                                */
                                        default:
                                            str = str + e.value1 + '\'';
                                            break;
                                    }

                                    if (e.children.length) {
                                        $.each(e.children, function (i, exp) {
                                            str = str + iterate(exp);
                                        });
                                    }
                                    str = str + ') ';
                                }
                                return str;
                            }

                            $.each($scope.filter.filterExpression, function (i, e) {
                                if (e.column)
                                    queryString = queryString + iterate(e);
                            });

                            return queryString;
                        },
                        applyFilter: function () {
                            $scope.grid.loadDataSet();
                        },
                        prepareFilterSave: function () {
                            var expressions = [];
                            (function iterate(exp, dest) {
                                $.each(exp, function (i, e) {
                                    var obj = {
                                        boolean: e.boolean,
                                        column: e.column,
                                        operator: e.operator,
                                        dataType: e.dataType,
                                        value1: e.value1,
                                        value2: e.value2,
                                        children: []
                                    };

                                    if (e.children.length)
                                        iterate(e.children, obj.children);

                                    dest.push(obj);
                                });
                            })($scope.filter.filterExpression, expressions);

                            return expressions;
                        },
                        getFilterById: function (id) {
                            var fObj = {};
                            $.each($scope.filter.filterList, function (i, filter) {
                                if (filter.ID == id)
                                    fObj = filter;
                            });
                            return fObj;
                        },
                        saveFilter: function (saveAs) {
                            var id = 0;
                            if ($scope.filter.currentFilterExpression > 0 && !saveAs) {
                                id = $scope.filter.currentFilterExpression;
                                var fObj = $scope.filter.getFilterById(id);
                                $scope.filter.saveHandler(id, fObj.Name, JSON.stringify($scope.filter.prepareFilterSave()), $scope.filter.setAsDefault);
                            }
                            else {
                                $.prompt('Enter Filter Name', {
                                    onComplete: function (res, value) {
                                        if (res == 'Ok') {
                                            var fname = $.trim(value);
                                            if (fname == '')
                                                return false;
                                            $scope.filter.saveHandler(id, fname, JSON.stringify($scope.filter.prepareFilterSave()), $scope.filter.setAsDefault);
                                        }
                                    }
                                });
                            }
                        },
                        saveHandler: function (id, fname, fvalue, isDefault) {
                            var data = {};
                            data.ID = id;
                            data.Name = fname;
                            data.FilterType = 1;
                            data.GridID = $scope.grid.extendedObject.GridID;
                            data.UserID = null;
                            data.UpdatedOn = null;
                            data.Expression = fvalue;
                            data.IsDefault = !!isDefault;

                            CustomGridService.saveFilter(path + 'api/grid/CreateOrUpdateFilter', data, 'POST', $scope.headers).then(function (data) {
                                $.notify('Filter saved successfully', { type: 'success' });
                                $scope.filter.init();
                            });
                        },
                        loadExpression: function (e) {
                            if ($scope.filter.currentFilterExpression > 0) {
                                var fObj = $scope.filter.getFilterById($scope.filter.currentFilterExpression);
                                if (fObj) {
                                    $scope.filter.filterExpression = $.parseJSON(fObj.Expression);
                                    $scope.filter.currentFilterExpression = fObj.ID;
                                    $scope.filter.setAsDefault = fObj.IsDefault;
                                    (function iterate(exp) {
                                        $.each(exp, function (i, e) {
                                            e.parent = exp;
                                            if (e.children.length)
                                                iterate(e.children);
                                        });
                                    })($scope.filter.filterExpression);
                                }
                            }
                            else {
                                $scope.filter.filterExpression = [];
                                $scope.filter.setAsDefault = false;
                            }

                            $scope.grid.loadDataSet();
                        },
                        init: function () {
                            if ($scope.filter.showFilterExpression) {
                                $scope.filter.filterExpression = [];
                                $scope.filter.filterExpressionActive = false;
                                $scope.filter.currentFilterExpression = 0;
                                $scope.filter.setAsDefault = false;

                                var data = { gridId: $scope.grid.extendedObject.GridID };
                                CustomGridService.loadFilter(path + 'api/grid/GetGridFilters', data, 'GET', $scope.headers).then(function (data) {
                                    $scope.filter.filterList = data;
                                    $scope.filter.filterList.splice(0, 0, { ID: 0, Name: '' });
                                    $scope.initLoad = false;
                                    var hasDefault = false;
                                    $.each($scope.filter.filterList, function () {
                                        if (this.IsDefault) {
                                            $scope.filter.currentFilterExpression = this.ID;
                                            hasDefault = true;
                                        }
                                    });
                                    if (hasDefault)
                                        $scope.filter.loadExpression();
                                    else
                                        $scope.grid.loadDataSet();
                                });
                            }
                        }
                    };

                    $scope.orderby = function (col) {
                        $scope.sort.reverse = ($scope.sort.column == col) ? !$scope.sort.reverse : false;
                        $scope.sort.column = col;
                    };

                    //watch
                    $scope.$watch('gridOptions', function (v) {
                        $scope.grid.init();
                        $scope.pagination.init();
                    });

                    $scope.$watch('gridOptions.rows', function (v) {
                        $scope.grid.refresh();
                    });
                    
                    $scope.$watch('groupBy', function (v) {
                        if ($scope.groupBy) {
                            $scope.setGroup($scope.groupBy);
                            $scope.pagination.update();
                        }
                    });

                    $scope.$watch('filter', function (v) {
                        $scope.pagination.update();
                    });

                    $scope.$watch('pagination.pageSize', function (v) {
                        $scope.pagination.update();
                        if ($scope.grid.serverPaging && !$scope.grid.isLoading && !$scope.initLoad) {

                            $scope.grid.loadDataSet();
                        }
                    });

                    /*$scope.$watch('filter.search', function(ov , nv){
                        if(nv!=ov){
                            if($scope.grid.serverPaging)
                                $scope.grid.loadDataSet();
                        }
                    });
                    $scope.$watch('filter.columns', function(ov , nv){
                        if(nv!=ov){
                            if($scope.grid.serverPaging)
                                $scope.grid.loadDataSet();
                        }
                    });*/
                }
            };
        }]);

    /*
        UI File Upload
    */

    angular.module('glams.ui.upload', [])
    .factory('GlamsFileUploadService', ['$q', '$http', function ($q, $http) {
        var GlamsFileUploadService = {};
        GlamsFileUploadService.getData = function (url) {
            var dObj = $q.defer();
            $http.get(url).success(function (data, status) {
                dObj.resolve(data);
            }).error(function (data, status) {
                dObj.reject({ data: data, status: status });
            });
            return dObj.promise;
        };
        return GlamsFileUploadService;
    }])
    .directive('fileUpload', ['GlamsFileUploadService', function (GlamsFileUploadService) {
        var template = ['<div class="file-upload">',
                           '<div class="input-group">',
                             '<div class="form-control" ng-if="!multiple"><i class="fa fa-file" ng-if="FileUpload.uploadingFiles.length"></i>&nbsp;{{FileUpload.uploadingFiles[FileUpload.uploadingFiles.length-1].FileName}}<i ng-if="allowedTypes" class="hint-text">(Allowed: {{allowedTypes}})</i></div>',
                             '<div class="form-control" ng-if="multiple"><i class="fa fa-file" ng-if="FileUpload.uploadingFiles.length"></i> {{FileUpload.uploadingFiles.length}} file<span ng-show="FileUpload.uploadingFiles.length>1">s</span> Selcted <i class="hint-text" ng-if="allowedTypes">(Allowed: {{allowedTypes}})</i></div>',
                             '<div class="input-group-btn">',
                               '<button type="button" class="btn gbtn-default" ng-click="FileUpload.clear(true)" ng-if="FileUpload.uploadingFiles.length>0"><i class="fa fa-times"></i> Remove All</button>',
                               '<div class="btn gbtn-default"> <i class="glyphicon glyphicon-folder-open"></i> &nbsp;Browse... <input name="file" type="file" class="file"></div>',
                             '</div>',
                           '</div>',
                           '<div class="file-upload-container" ng-init="init()">',
                               '<ul>',
                                   '<li ng-repeat="file in FileUpload.uploadingFiles">',
                                       '<div class="progress">',
                                           '<div class="progress-bar progress-bar-success progress-bar-striped" ng-class="{active:file.Progress<100}"  role="progressbar" ng-style="FileUpload.getStyle(file)">',
                                                '<span class="file-name">{{file.FileName}}</span>',
                                                '<span class="progress-txt" ng-if="file.Progress<100">{{file.Progress}}% Complete</span>',
                                                '<span class="progress-txt" ng-if="file.Progress>=100">{{file.Status}}</span>',
                                                '<i class="abort fa fa-times-circle" ng-click="FileUpload.abort(file)"></i>',
                                           '</div>',
                                       '</div>',
                                   '</li>',
                               '</ul>',
                           '</div>',
                       '</div>'].join('');
        return {
            restrict: 'EA',
            replace: true,
            require: "ngModel",
            transclude: false,
            template: template,
            scope: {
                multiple: "=multiple",
                serviceUrl: "@serviceUrl",
                allowedTypes: "@allowedTypes",
                maxFiles: "=maxFiles",
                model: '=ngModel'
            },
            controller: function ($scope, $element, $attrs, $timeout) {

                $scope.init = function () {
                    setTimeout($scope.FileUpload.init, 0);
                }

                $scope.FileUpload = {
                    uploadingFiles: [],
                    Form: null,
                    getStyle: function (file) {
                        return { width: file.Progress + "%" };
                    },
                    clear: function (deepClear) {
                        $($scope.FileUpload.uploadingFiles).each(function (i, f) {
                            f.Connection && f.Connection.stop();
                            f.Frame && $(f.Frame).remove();
                        });
                        $scope.FileUpload.uploadingFiles.splice(0, $scope.FileUpload.uploadingFiles.length);
                        $scope.model = [];
                        if (deepClear) {
                            $.browser.msie ? $scope.FileUpload.element.replaceWith($scope.FileUpload.element.clone(true)) : ($scope.FileUpload.element[0].value = "");
                        }
                    },
                    abort: function (fileObj) {
                        fileObj.uploadObj && fileObj.uploadObj.abort();
                        fileObj.Connection && fileObj.Connection.stop();
                        fileObj.Frame && $(fileObj.Frame).remove();
                        var index = $.inArray(fileObj, $scope.FileUpload.uploadingFiles);
                        (index >= 0) && ($scope.FileUpload.uploadingFiles.splice(index, 1))
                        $scope.FileUpload.removeCompletedFileRef(fileObj);
                        console.log($scope.model);
                    },
                    removeCompletedFileRef: function (fileObj) {
                        if(!fileObj.completedFileRef)
                            return;

                        var index = $.inArray(fileObj.completedFileRef, $scope.model);
                        (index >= 0) && ($scope.model) && ($scope.model.splice(index, 1));
                    },
                    init: function () {
                        $scope.FileUpload.element = $element.find(':file').filter(':visible');
                        $scope.FileUpload.Form = $element.parents('form').eq(0);
                        $scope.model = [];
                        if ($.browser.msie)
                            $scope.FileUpload.element[0].attachEvent('onpropertychange', function (event) {
                                if (event.propertyName === "value")
                                    $scope.FileUpload.FileSelected();
                            });
                        else
                            $scope.FileUpload.element.bind("change", function () {
                                $scope.FileUpload.FileSelected();
                            });
                    },
                    FileSelected: function () {
                        var elm = $scope.FileUpload.element[0];
                        if ($scope.multiple && ($scope.maxFiles && $scope.FileUpload.uploadingFiles.length == $scope.maxFiles)) {
                            $.alert('Maximum <b>' + $scope.maxFiles + '</b> files allowed to upload', { icon: "error" });
                            elm.value = "";
                            return false;
                        }
                        var fileArr = [];
                        var files = elm.files ? elm.files[0] : elm.value;
                        var fileName = (typeof files == 'string') ? files.substring(files.lastIndexOf("\\") + 1) : files.name;
                        if (!$scope.multiple)
                            $scope.FileUpload.clear();

                        if ($scope.allowedTypes) {
                            var fileTypes = new RegExp("^.*\.(" + $scope.allowedTypes.replace(/\,/gi, "|") + ")$");
                            if (!fileTypes.test(fileName)) {
                                $.alert('Allowed file types: <b>' + $scope.allowedTypes + '</b>', { icon: "error" });
                                elm.value = "";
                                return false;
                            }
                        }

                        fileArr.push(fileName);
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $.each(fileArr, function (i, file) {
                                    if (file != "") {
                                        var fileObj = { FileName: file, Progress: 0, Status: '', Frame: null, FileId: 0, Connection: null }
                                        var fileExt = file.substring(file.lastIndexOf('.') + 1);

                                        $scope.FileUpload.uploadingFiles.push(fileObj);
                                        $scope.FileUpload.initUpload(fileObj, elm);
                                    }
                                });
                            });
                        }, 1);
                    },
                    initUpload: function (currentFileObj, felm) {

                        var hub = $.connection.uploadHub;

                        hub.on('updateProgress', function (pct) {
                            currentFileObj.Progress = (+pct + 1).toFixed(2);
                            var progress = Math.round(currentFileObj.Progress);
                            currentFileObj.Status = progress >= 100 ? 'Creating previews....' : 'Uploading...';
                            $scope.$apply();
                        });

                        currentFileObj.Connection = hub.connection;

                        currentFileObj.Connection.start().done(function () {
                            var iframe = $('<iframe/>');
                            var targetId = currentFileObj.Connection.id;

                            currentFileObj.Frame = iframe;

                            if ($scope.serviceUrl.indexOf('?') >= 0)
                                $scope.FileUpload.Form.attr('action', $scope.serviceUrl + '&id=' + targetId);
                            else
                                $scope.FileUpload.Form.attr('action', $scope.serviceUrl + '?id=' + targetId);

                            iframe.prop({ 'id': targetId, 'name': targetId }).hide();
                            $scope.FileUpload.Form.parent().append(iframe);

                            $scope.FileUpload.Form.attr('target', targetId);

                            iframe.on('load', function () {
                                currentFileObj.Status = '';

                                var fileObj = iframe.contents().find('string').html();
                                currentFileObj.completedFileRef = fileObj;
                                if ($scope.multiple)
                                    $scope.model.push(fileObj);
                                else
                                    $scope.model = [fileObj];

                                setTimeout(function () {
                                    currentFileObj.Connection.stop();
                                    hub.off('updateProgress');
                                    $scope.$apply();
                                    iframe.remove();
                                }, 200);
                            });

                            $scope.FileUpload.Form.attr('method', 'post');
                            $scope.FileUpload.Form.attr('enctype', 'multipart/form-data');

                            $scope.FileUpload.Form.submit();
                            $timeout(function () {
                                $(felm).val("");
                            }, 200);
                        }).fail(function () { console.log('Could not connect'); });
                    }
                };

            },
            link: function (scope, element, attrs) {

            }
        };
    }]);

    /*
        UI Color Picker
    */

    angular.module('glams.ui.colorpicker', [])
    .factory('Helper', function () {
        return {
            closestSlider: function (elem) {
                var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
                if (matchesSelector.bind(elem)('I')) {
                    return elem.parentNode;
                }
                return elem;
            },
            getOffset: function (elem, fixedPosition) {
                var
                    x = 0,
                    y = 0,
                    scrollX = 0,
                    scrollY = 0;
                while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
                    x += elem.offsetLeft;
                    y += elem.offsetTop;
                    if (!fixedPosition && elem.tagName === 'BODY') {
                        scrollX += document.documentElement.scrollLeft || elem.scrollLeft;
                        scrollY += document.documentElement.scrollTop || elem.scrollTop;
                    } else {
                        scrollX += elem.scrollLeft;
                        scrollY += elem.scrollTop;
                    }
                    elem = elem.offsetParent;
                }
                return {
                    top: y,
                    left: x,
                    scrollX: scrollX,
                    scrollY: scrollY
                };
            },
            // a set of RE's that can match strings and generate color tuples. https://github.com/jquery/jquery-color/
            stringParsers: [
              {
                  re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                  parse: function (execResult) {
                      return [
                        execResult[1],
                        execResult[2],
                        execResult[3],
                        execResult[4]
                      ];
                  }
              },
              {
                  re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
                  parse: function (execResult) {
                      return [
                        2.55 * execResult[1],
                        2.55 * execResult[2],
                        2.55 * execResult[3],
                        execResult[4]
                      ];
                  }
              },
              {
                  re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
                  parse: function (execResult) {
                      return [
                        parseInt(execResult[1], 16),
                        parseInt(execResult[2], 16),
                        parseInt(execResult[3], 16)
                      ];
                  }
              },
              {
                  re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
                  parse: function (execResult) {
                      return [
                        parseInt(execResult[1] + execResult[1], 16),
                        parseInt(execResult[2] + execResult[2], 16),
                        parseInt(execResult[3] + execResult[3], 16)
                      ];
                  }
              }
            ]
        };
    })
    .factory('Color', ['Helper', function (Helper) {
        return {
            value: {
                h: 1,
                s: 1,
                b: 1,
                a: 1
            },
            // translate a format from Color object to a string
            'rgb': function () {
                var rgb = this.toRGB();
                return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
            },
            'rgba': function () {
                var rgb = this.toRGB();
                return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')';
            },
            'hex': function () {
                return this.toHex();
            },

            // HSBtoRGB from RaphaelJS
            RGBtoHSB: function (r, g, b, a) {
                r /= 255;
                g /= 255;
                b /= 255;

                var H, S, V, C;
                V = Math.max(r, g, b);
                C = V - Math.min(r, g, b);
                H = (C === 0 ? null :
                    V === r ? (g - b) / C :
                        V === g ? (b - r) / C + 2 :
                            (r - g) / C + 4
                    );
                H = ((H + 360) % 6) * 60 / 360;
                S = C === 0 ? 0 : C / V;
                return { h: H || 1, s: S, b: V, a: a || 1 };
            },

            //parse a string to HSB
            setColor: function (val) {
                val = val.toLowerCase();
                for (var key in Helper.stringParsers) {
                    if (Helper.stringParsers.hasOwnProperty(key)) {
                        var parser = Helper.stringParsers[key];
                        var match = parser.re.exec(val),
                            values = match && parser.parse(match);
                        if (values) {
                            this.value = this.RGBtoHSB.apply(null, values);
                            return false;
                        }
                    }
                }
            },

            setHue: function (h) {
                this.value.h = 1 - h;
            },

            setSaturation: function (s) {
                this.value.s = s;
            },

            setLightness: function (b) {
                this.value.b = 1 - b;
            },

            setAlpha: function (a) {
                this.value.a = parseInt((1 - a) * 100, 10) / 100;
            },

            // HSBtoRGB from RaphaelJS
            // https://github.com/DmitryBaranovskiy/raphael/
            toRGB: function (h, s, b, a) {
                if (!h) {
                    h = this.value.h;
                    s = this.value.s;
                    b = this.value.b;
                }
                h *= 360;
                var R, G, B, X, C;
                h = (h % 360) / 60;
                C = b * s;
                X = C * (1 - Math.abs(h % 2 - 1));
                R = G = B = b - C;

                h = ~~h;
                R += [C, X, 0, 0, X, C][h];
                G += [X, C, C, X, 0, 0][h];
                B += [0, 0, X, C, C, X][h];
                return {
                    r: Math.round(R * 255),
                    g: Math.round(G * 255),
                    b: Math.round(B * 255),
                    a: a || this.value.a
                };
            },

            toHex: function (h, s, b, a) {
                var rgb = this.toRGB(h, s, b, a);
                return '#' + ((1 << 24) | (parseInt(rgb.r, 10) << 16) | (parseInt(rgb.g, 10) << 8) | parseInt(rgb.b, 10)).toString(16).substr(1);
            }
        };
    }])
    .factory('Slider', ['Helper', function (Helper) {
        var
            slider = {
                maxLeft: 0,
                maxTop: 0,
                callLeft: null,
                callTop: null,
                knob: {
                    top: 0,
                    left: 0
                }
            },
            pointer = {};

        return {
            getSlider: function () {
                return slider;
            },
            getLeftPosition: function (event) {
                return Math.max(0, Math.min(slider.maxLeft, slider.left + ((event.pageX || pointer.left) - pointer.left)));
            },
            getTopPosition: function (event) {
                return Math.max(0, Math.min(slider.maxTop, slider.top + ((event.pageY || pointer.top) - pointer.top)));
            },
            setSlider: function (event, fixedPosition) {
                var
                  target = Helper.closestSlider(event.target),
                  targetOffset = Helper.getOffset(target, fixedPosition);
                slider.knob = target.children[0].style;
                slider.left = event.pageX - targetOffset.left - window.pageXOffset + targetOffset.scrollX;
                slider.top = event.pageY - targetOffset.top - window.pageYOffset + targetOffset.scrollY;

                pointer = {
                    left: event.pageX,
                    top: event.pageY
                };
            },
            setSaturation: function (event, fixedPosition) {
                slider = {
                    maxLeft: 100,
                    maxTop: 100,
                    callLeft: 'setSaturation',
                    callTop: 'setLightness'
                };
                this.setSlider(event, fixedPosition);
            },
            setHue: function (event, fixedPosition) {
                slider = {
                    maxLeft: 0,
                    maxTop: 100,
                    callLeft: false,
                    callTop: 'setHue'
                };
                this.setSlider(event, fixedPosition);
            },
            setAlpha: function (event, fixedPosition) {
                slider = {
                    maxLeft: 0,
                    maxTop: 100,
                    callLeft: false,
                    callTop: 'setAlpha'
                };
                this.setSlider(event, fixedPosition);
            },
            setKnob: function (top, left) {
                slider.knob.top = top + 'px';
                slider.knob.left = left + 'px';
            }
        };
    }])
    .directive('colorpicker', ['$document', '$compile', 'Color', 'Slider', 'Helper', function ($document, $compile, Color, Slider, Helper) {
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function ($scope, elem, attrs, ngModel) {
                var
                    thisFormat = attrs.colorpicker ? attrs.colorpicker : 'hex',
                    position = angular.isDefined(attrs.colorpickerPosition) ? attrs.colorpickerPosition : 'bottom',
                    fixedPosition = angular.isDefined(attrs.colorpickerFixedPosition) ? attrs.colorpickerFixedPosition : false,
                    target = angular.isDefined(attrs.colorpickerParent) ? elem.parent() : angular.element(document.body),
                    withInput = angular.isDefined(attrs.colorpickerWithInput) ? attrs.colorpickerWithInput : false,
                    inputTemplate = withInput ? '<input type="text" name="colorpicker-input">' : '',
                    template =
                        '<div class="colorpicker dropdown">' +
                            '<div class="dropdown-menu">' +
                            '<colorpicker-saturation><i></i></colorpicker-saturation>' +
                            '<colorpicker-hue><i></i></colorpicker-hue>' +
                            '<colorpicker-alpha><i></i></colorpicker-alpha>' +
                            '<colorpicker-preview></colorpicker-preview>' +
                            inputTemplate +
                            '<button class="close close-colorpicker">&times;</button>' +
                            '</div>' +
                            '</div>',
                    colorpickerTemplate = angular.element(template),
                    pickerColor = Color,
                    sliderAlpha,
                    sliderHue = colorpickerTemplate.find('colorpicker-hue'),
                    sliderSaturation = colorpickerTemplate.find('colorpicker-saturation'),
                    colorpickerPreview = colorpickerTemplate.find('colorpicker-preview'),
                    pickerColorPointers = colorpickerTemplate.find('i');

                $compile(colorpickerTemplate)($scope);

                if (withInput) {
                    var pickerColorInput = colorpickerTemplate.find('input');
                    pickerColorInput
                        .on('mousedown', function (event) {
                            event.stopPropagation();
                        })
                        .on('keyup', function (event) {
                            var newColor = this.value;
                            elem.val(newColor);
                            if (ngModel) {
                                $scope.$apply(ngModel.$setViewValue(newColor));
                            }
                            event.stopPropagation();
                            event.preventDefault();
                        });
                    elem.on('keyup', function () {
                        pickerColorInput.val(elem.val());
                    });
                }

                var bindMouseEvents = function () {
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                };

                if (thisFormat === 'rgba') {
                    colorpickerTemplate.addClass('alpha');
                    sliderAlpha = colorpickerTemplate.find('colorpicker-alpha');
                    sliderAlpha
                        .on('click', function (event) {
                            Slider.setAlpha(event, fixedPosition);
                            mousemove(event);
                        })
                        .on('mousedown', function (event) {
                            Slider.setAlpha(event, fixedPosition);
                            bindMouseEvents();
                        });
                }

                sliderHue
                    .on('click', function (event) {
                        Slider.setHue(event, fixedPosition);
                        mousemove(event);
                    })
                    .on('mousedown', function (event) {
                        Slider.setHue(event, fixedPosition);
                        bindMouseEvents();
                    });

                sliderSaturation
                    .on('click', function (event) {
                        Slider.setSaturation(event, fixedPosition);
                        mousemove(event);
                    })
                    .on('mousedown', function (event) {
                        Slider.setSaturation(event, fixedPosition);
                        bindMouseEvents();
                    });

                if (fixedPosition) {
                    colorpickerTemplate.addClass('colorpicker-fixed-position');
                }

                colorpickerTemplate.addClass('colorpicker-position-' + position);

                target.append(colorpickerTemplate);

                if (ngModel) {
                    ngModel.$render = function () {
                        elem.val(ngModel.$viewValue);
                    };
                    $scope.$watch(attrs.ngModel, function () {
                        update();
                    });
                }

                elem.on('$destroy', function () {
                    colorpickerTemplate.remove();
                });

                var previewColor = function () {
                    try {
                        colorpickerPreview.css('backgroundColor', pickerColor[thisFormat]());
                    } catch (e) {
                        colorpickerPreview.css('backgroundColor', pickerColor.toHex());
                    }
                    sliderSaturation.css('backgroundColor', pickerColor.toHex(pickerColor.value.h, 1, 1, 1));
                    if (thisFormat === 'rgba') {
                        sliderAlpha.css.backgroundColor = pickerColor.toHex();
                    }
                };

                var mousemove = function (event) {
                    var
                        left = Slider.getLeftPosition(event),
                        top = Slider.getTopPosition(event),
                        slider = Slider.getSlider();

                    Slider.setKnob(top, left);

                    if (slider.callLeft) {
                        pickerColor[slider.callLeft].call(pickerColor, left / 100);
                    }
                    if (slider.callTop) {
                        pickerColor[slider.callTop].call(pickerColor, top / 100);
                    }
                    previewColor();
                    var newColor = pickerColor[thisFormat]();
                    elem.val(newColor);
                    if (ngModel) {
                        $scope.$apply(ngModel.$setViewValue(newColor));
                    }
                    if (withInput) {
                        pickerColorInput.val(newColor);
                    }
                    return false;
                };

                var mouseup = function () {
                    $document.off('mousemove', mousemove);
                    $document.off('mouseup', mouseup);
                };

                var update = function () {
                    pickerColor.setColor(elem.val());
                    pickerColorPointers.eq(0).css({
                        left: pickerColor.value.s * 100 + 'px',
                        top: 100 - pickerColor.value.b * 100 + 'px'
                    });
                    pickerColorPointers.eq(1).css('top', 100 * (1 - pickerColor.value.h) + 'px');
                    pickerColorPointers.eq(2).css('top', 100 * (1 - pickerColor.value.a) + 'px');
                    previewColor();
                };

                var getColorpickerTemplatePosition = function () {
                    var
                        positionValue,
                        positionOffset = Helper.getOffset(elem[0]);

                    if (angular.isDefined(attrs.colorpickerParent)) {
                        positionOffset.left = 0;
                        positionOffset.top = 0;
                    }

                    if (position === 'top') {
                        positionValue = {
                            'top': positionOffset.top - 147,
                            'left': positionOffset.left
                        };
                    } else if (position === 'right') {
                        positionValue = {
                            'top': positionOffset.top,
                            'left': positionOffset.left + 126
                        };
                    } else if (position === 'bottom') {
                        positionValue = {
                            'top': positionOffset.top + elem[0].offsetHeight + 2,
                            'left': positionOffset.left
                        };
                    } else if (position === 'left') {
                        positionValue = {
                            'top': positionOffset.top,
                            'left': positionOffset.left - 150
                        };
                    }
                    return {
                        'top': positionValue.top + 'px',
                        'left': positionValue.left + 'px'
                    };
                };

                var documentMousedownHandler = function () {
                    hideColorpickerTemplate();
                };

                elem.on('click', function () {
                    update();
                    colorpickerTemplate
                        .addClass('colorpicker-visible')
                        .css(getColorpickerTemplatePosition());

                    // register global mousedown event to hide the colorpicker
                    $document.on('mousedown', documentMousedownHandler);
                });

                colorpickerTemplate.on('mousedown', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                });

                var emitEvent = function (name) {
                    if (ngModel) {
                        $scope.$emit(name, {
                            name: attrs.ngModel,
                            value: ngModel.$modelValue
                        });
                    }
                };

                var hideColorpickerTemplate = function () {
                    if (colorpickerTemplate.hasClass('colorpicker-visible')) {
                        colorpickerTemplate.removeClass('colorpicker-visible');
                        emitEvent('colorpicker-closed');
                        // unregister the global mousedown event
                        $document.off('mousedown', documentMousedownHandler);
                    }
                };

                colorpickerTemplate.find('button').on('click', function () {
                    hideColorpickerTemplate();
                });
            }
        };
    }]);

    /* checkbox group model */
    angular.module('glams.ui.checklistmodel', [])
    .directive('checklistModel', ['$parse', '$compile', function ($parse, $compile) {
        // contains
        function contains(arr, item) {
            if (angular.isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        // add
        function add(arr, item) {
            arr = angular.isArray(arr) ? arr : [];
            for (var i = 0; i < arr.length; i++) {
                if (angular.equals(arr[i], item)) {
                    return arr;
                }
            }
            arr.push(item);
            return arr;
        }

        // remove
        function remove(arr, item) {
            if (angular.isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                    if (angular.equals(arr[i], item)) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return arr;
        }

        // http://stackoverflow.com/a/19228302/1458162
        function postLinkFn(scope, elem, attrs) {
            // compile with `ng-model` pointing to `checked`
            $compile(elem)(scope);

            // getter / setter for original model
            var getter = $parse(attrs.checklistModel);
            var setter = getter.assign;

            // value added to list
            var value = $parse(attrs.checklistValue)(scope.$parent);

            // watch UI checked change
            scope.$watch('checked', function (newValue, oldValue) {
                if (newValue === oldValue) {
                    return;
                }
                var current = getter(scope.$parent);
                if (newValue === true) {
                    setter(scope.$parent, add(current, value));
                } else {
                    setter(scope.$parent, remove(current, value));
                }
            });

            // watch original model change
            scope.$parent.$watch(attrs.checklistModel, function (newArr, oldArr) {
                scope.checked = contains(newArr, value);
            }, true);
        }

        return {
            restrict: 'A',
            priority: 1000,
            terminal: true,
            scope: true,
            compile: function (tElement, tAttrs) {
                if (tElement[0].tagName !== 'INPUT' || tAttrs.type !== 'checkbox') {
                    throw 'checklist-model should be applied to `input[type="checkbox"]`.';
                }

                if (!tAttrs.checklistValue) {
                    throw 'You should provide `checklist-value`.';
                }

                // exclude recursion
                tElement.removeAttr('checklist-model');

                // local scope var storing individual checkbox model
                tElement.attr('ng-model', 'checked');

                return postLinkFn;
            }
        };
    }]);
    /* UI tree*/
    angular.module('glams.ui.tree', ['ngSanitize'])
    .factory('TreeService', ['$q', '$http', function ($q, $http) {
        var TreeService = {};
        TreeService.loadTreeData = function (action) {
            var dObj = $q.defer();
            $http.get(action).success(function (data) {
                dObj.resolve(data);
            })
            return dObj.promise;
        };
        return TreeService;
    }])
    .directive('dynamicHtml', function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                dynamic: '=dynamicHtml',
                cscope: '=cscope'
            },
            link: function postLink(scope, element, attrs) {
                scope.$watch('dynamic', function (html) {
                    element.html(html);
                    $compile(element.contents())(scope.cscope);
                });
            }
        };
    })
    .directive('tree', ['TreeService', function (TreeService) {
        return {
            template: ['<div class="_tree-container" ng-init="init()">',
                       '<div class="_tree-head"><a href="#" ng-click="toggleTree(true)"><i class="fa fa-plus"></i> Expand All</a> / <a href="#" ng-click="toggleTree(false)"><i class="fa fa-minus"></i> Collapse All</a></div>',
                       '<ul>',
                            '<li ng-repeat="tree in tree" class="_tree" ng-class="{expand:tree._expand}" ng-init="tree._expand=!!tree._expand">',
                                '<i class="collapse-icon fa fa-{{tree._expand?\'minus\':\'plus\'}}" ng-if="tree.tree.length" ng-click="tree._expand=!tree._expand"></i>',
                                '<div cscope="this" dynamic-html="getDataTemplate()"></div>',
                                '<div ng-if="tree.tree.length" ng-show="tree._expand">',
                                    '<div ng-include="getTreeTemplate()"></div>',
                                '</div>',
                           '</li>',
                        '</ul>',
                      '</div>'].join(''),
            // require:'?ngModel',
            restrict: 'EA',
            replace: true,
            scope: {
                model: '=ngModel',
                treeConfig: '=config'
            },
            controller: function ($scope) {
                $scope.tree = $scope.treeConfig.data;
                $scope.getTreeTemplate = function () {
                    return path + 'Scripts/lib/ui-templates/tree.html';
                };
                $scope.init = function () {
                    if ($scope.treeConfig.dataUrl) {
                        TreeService.loadTreeData($scope.treeConfig.dataUrl).then(function (data) {
                            $scope.tree = data;
                            $scope.toggleTree($scope.treeConfig.expandAll);
                        });
                    }
                    else
                        $scope.toggleTree($scope.treeConfig.expandAll);
                };
                $scope.getDataTemplate = function () {
                    return $scope.treeConfig.template || '{{t}}';
                };
                $scope.toggleTree = function (expand) {
                    (function iterate(tree) {
                        $.each(tree, function (i, t) {
                            if (t.tree && t.tree.length) {
                                t._expand = !!expand;
                                iterate(t.tree);
                            }
                        });
                    })($scope.tree);
                };
            }
        };
    }]);

    angular.module('glams.module.validation', [])
    .service('Validator', function () {
        var validator = this;
        validator.addRule = function (name, fn) {
            validator[name] = fn;
        };

        validator.required = validator.empty = function (value) {
            return /.+/.test(value);
        };

        validator.number = function (value) {
            return /^[-+]?[0-9]*[\.]?[0-9]*$/.test(value);
        };

        validator.email = function (value) {
            return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value);
        };

        validator.url = function (value) {
            return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(value);
        };

        validator.alphanum = function (value) {
            return /^[a-zA-Z0-9\s]*$/.test(value);
        };

        validator.alphabets = function () {
            return /^[a-zA-Z]*$/.test(value);
        };
    });


    /* CKEDITOR */
    var app = angular.module('ngCkeditor', []);
    var $defer, loaded = false;

    app.run(['$q', '$timeout', function ($q, $timeout) {
        $defer = $q.defer();

        if (angular.isUndefined(CKEDITOR)) {
            throw new Error('CKEDITOR not found');
        }
        CKEDITOR.disableAutoInline = true;
        function checkLoaded() {
            if (CKEDITOR.status == 'loaded') {
                loaded = true;
                $defer.resolve();
            } else {
                checkLoaded();
            }
        }
        CKEDITOR.on('loaded', checkLoaded);
        $timeout(checkLoaded, 100);
    }])

    app.directive('ckeditor', ['$timeout', '$q', function ($timeout, $q) {
        'use strict';

        return {
            restrict: 'AC',
            require: ['ngModel', '^?form'],
            scope: false,
            link: function (scope, element, attrs, ctrls) {
                var ngModel = ctrls[0];
                var form = ctrls[1] || null;
                var EMPTY_HTML = '<p></p>',
                    isTextarea = element[0].tagName.toLowerCase() == 'textarea',
                    data = [],
                    isReady = false;

                if (!isTextarea) {
                    element.attr('contenteditable', true);
                }

                var onLoad = function () {
                    var options = {
                        toolbar: 'full',
                        toolbar_full: [
                            {
                                name: 'basicstyles',
                                items: ['Bold', 'Italic', 'Strike', 'Underline']
                            },
                            { name: 'paragraph', items: ['BulletedList', 'NumberedList', 'Blockquote'] },
                            { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                            { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
                            { name: 'tools', items: ['SpellChecker', 'Maximize'] },
                            '/',
                            { name: 'styles', items: ['Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat'] },
                            { name: 'insert', items: ['Image', 'Table', 'SpecialChar'] },
                            { name: 'forms', items: ['Outdent', 'Indent'] },
                            { name: 'clipboard', items: ['Undo', 'Redo'] },
                            { name: 'document', items: ['PageBreak', 'Source'] }
                        ],
                        disableNativeSpellChecker: false,
                        uiColor: '#FAFAFA',
                        height: '400px',
                        width: '100%'
                    };
                    options = angular.extend(options, scope[attrs.ckeditor]);

                    // you can use ckreadonly attribute to bind a variable
                    // to set the editor readOnly status
                    if (attrs.ckreadonly) {
                        // if ckreadonly attribute is present, 
                        // set editor readOnly option
                        var isReadOnly = scope.$eval(attrs.ckreadonly);
                        options.readOnly = isReadOnly;

                        // setup a watch on the attribute value
                        // to update the editor readOnly mode 
                        // when value changes
                        scope.$watch(attrs.ckreadonly, function (value) {
                            // ignore callback if editable instance 
                            // is not ready yet
                            if (instance && isReady) {
                                instance.setReadOnly(value);
                            }
                        });
                    }

                    var instance = (isTextarea) ? CKEDITOR.replace(element[0], options) : CKEDITOR.inline(element[0], options),
                        configLoaderDef = $q.defer();

                    element.bind('$destroy', function () {
                        instance.destroy(
                            false //If the instance is replacing a DOM element, this parameter indicates whether or not to update the element with the instance contents.
                        );
                    });
                    var setModelData = function (setPristine) {
                        var data = instance.getData();
                        if (data == '') {
                            data = null;
                        }
                        $timeout(function () { // for key up event
                            (setPristine !== true || data != ngModel.$viewValue) && ngModel.$setViewValue(data);
                            (setPristine === true && form) && form.$setPristine();
                        }, 0);
                    }, onUpdateModelData = function (setPristine) {
                        if (!data.length) { return; }


                        var item = data.pop() || EMPTY_HTML;
                        isReady = false;
                        instance.setData(item, function () {
                            setModelData(setPristine);
                            isReady = true;
                        });
                    }

                    //instance.on('pasteState',   setModelData);
                    instance.on('change', setModelData);
                    instance.on('blur', setModelData);
                    //instance.on('key',          setModelData); // for source view

                    instance.on('instanceReady', function () {
                        scope.$broadcast("ckeditor.ready");
                        scope.$apply(function () {
                            onUpdateModelData(true);
                        });

                        instance.document.on("keyup", setModelData);
                    });
                    instance.on('customConfigLoaded', function () {
                        configLoaderDef.resolve();
                    });

                    ngModel.$render = function () {
                        data.push(ngModel.$viewValue);
                        if (isReady) {
                            onUpdateModelData();
                        }
                    };
                };

                if (CKEDITOR.status == 'loaded') {
                    loaded = true;
                }
                if (loaded) {
                    onLoad();
                } else {
                    $defer.promise.then(onLoad);
                }
            }
        };
    }]);

    //Glams Graph
    angular.module('glams.ui.chart', ['glams.ui.chart.linechart', 'glams.ui.chart.barchart', 'ngResource'])
    .config(function ($httpProvider) {
        $httpProvider.defaults.headers.common['RequestVerificationToken'] = $('[name="__RequestVerificationToken"]').val();
    })
    .value('googleChartApiConfig', {
        version: '1',
        optionalSettings: {
            packages: ['corechart']
        }
    })
    .value('GRAPH_EVENT', {
        Draw: 'DrawChart',
        FilterChanged: 'FilterChanged',
        GetData: 'GetData'
    })
    .provider('googleJsapiUrl', function () {
        var protocol = 'https:';
        var url = '//www.google.com/jsapi';

        this.setProtocol = function (newProtocol) {
            protocol = newProtocol;
        };

        this.setUrl = function (newUrl) {
            url = newUrl;
        };

        this.$get = function () {
            return (protocol ? protocol : '') + url;
        };
    })
    .factory('GraphService', function ($resource, $q) {
        return function (url) {
            return $resource(url, {}, {
                get: { isArray:true, method: "GET", params: { sp: "@sp", filters: '@filters' } }
            });
        }
    })
    .factory('googleChartApiPromise', ['$rootScope', '$q', 'googleChartApiConfig', 'googleJsapiUrl',
        function ($rootScope, $q, apiConfig, googleJsapiUrl) {
            var apiReady = $q.defer();
            var onLoad = function () {
                // override callback function
                var settings = {
                    callback: function () {
                        var oldCb = apiConfig.optionalSettings.callback;
                        $rootScope.$apply(function () {
                            apiReady.resolve();
                        });

                        if (angular.isFunction(oldCb)) {
                            oldCb.call(this);
                        }
                    }
                };

                settings = angular.extend({}, apiConfig.optionalSettings, settings);

                window.google.load('visualization', apiConfig.version, settings);
            };
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');

            script.setAttribute('type', 'text/javascript');
            script.src = googleJsapiUrl;

            if (script.addEventListener) { // Standard browsers (including IE9+)
                script.addEventListener('load', onLoad, false);
            } else { // IE8 and below
                script.onreadystatechange = function () {
                    if (script.readyState === 'loaded' || script.readyState === 'complete') {
                        script.onreadystatechange = null;
                        onLoad();
                    }
                };
            }

            head.appendChild(script);

            return apiReady.promise;
        }])
    .directive('graph', function (GraphService, $http, GRAPH_EVENT) {
        var graphTemplate = ['<div class="graph-container text-right">',
                                '<div class="gloader-container" ng-if="isLoading">',
                                    '<div class="gloader">Loading...</div>',
                                '</div>',
                                '<div class="btn-group btn-group-xs" role="group" aria-label="...">',
                                    // '<button type="button" ng-click="graph.defaultFilter = \'year\'" ng-class="{active:graph.defaultFilter == \'year\'}" class="btn btn-default">Year</button>',
                                    '<button type="button" ng-click="graph.defaultFilter = \'month\'" ng-class="{active:graph.defaultFilter == \'month\'}" class="btn btn-default">Month</button>',
                                    '<button type="button" ng-click="graph.defaultFilter = \'week\'" ng-class="{active:graph.defaultFilter == \'week\'}" class="btn btn-default">Week</button>',
                                    // '<button type="button" ng-click="graph.defaultFilter = \'day\'" ng-class="{active:graph.defaultFilter == \'day\'}" class="btn btn-default">Day</button>',
                                '</div>',
                                '<a ng-click="showFilter=!showFilter" ng-class="{active:showFilter}" class="filter-icon btn btn-default btn-xs"><i class="fa fa-filter"></i></a>',
                                '<div class="filters text-left" ng-show="showFilter">',
                                    '<div class="row">',
                                        '<div class="col-xs-3" style="padding-left:20px">',
                                            'Add Custom Filters',
                                            '<select custom-select="graph.filterSet" multiple ng-model="graph.selectedFilterSet">',
                                                '<option ng-repeat="fs in graph.filterSet" value="{{$index}}">{{fs.name}}</option>',
                                            '</select>',
                                        '</div>',
                                        '<div class="col-xs-9">',
                                            '<div class="mfilter">',
                                                '&nbsp;Date Range:<br/>',
                                                '<input type="text" size="15" placeholder="From Date" datepicker-popup ng-model="graph.fromDate">',
                                                '- <input type="text" size="15" placeholder="To Date" datepicker-popup ng-model="graph.toDate">',
                                            '</div>',
                                            '<div class="ofilter">',
                                                '<span ng-repeat="f in graph.filters" ng-switch="f.type" style="display:inline-block; margin-right:10px">',
                                                    '&nbsp;{{f.name}}<br/>',
                                                    '<select ng-switch-when="Combobox" custom-select="f.data" class="no-fluid" multiple ng-model="f.value" width="180px">',
                                                        '<option ng-repeat="fdata in f.data" value="{{fdata.value}}">{{fdata.name}}</option>',
                                                    '</select>',
                                                    '<input type="text" ng-switch-when="Textbox" ng-model="f.value" />',
                                                    '<input type="checkbox" ng-switch-when="Checkbox" ng-model="f.value" />',
                                                    '<input type="text" ng-switch-when="Datepicker" datepicker-popup ng-model="f.value" />',
                                                '</span>',
                                            '</div>',
                                            '<div class="text-right" style="padding-right:10px;">',
                                                '<a ng-click="showFilter=!showFilter" class="btn btn-xs btn-default"><i class="fa fa-close"></i> Close</a> ',
                                                '<a ng-click="resetFilter()" class="btn btn-xs btn-default"><i class="fa fa-erase"></i> Clear</a> ',
                                                '<a class="btn btn-xs btn-default" ng-click="applyFilter()"><i class="fa fa-filter"></i> Filter</a>',
                                            '</div>',
                                        '</div>',
                                    '</div>',                                    
                                '</div>',
                                '<div ng-if="graph.type==\'line\'">',
                                    '<div line-chart="graph"></div>',
                                '</div>',
                                '<div ng-if="graph.type==\'bar\'">',
                                    '<div bar-chart="graph"></div>',
                                '</div>',
                             '</div>'].join('');
        return {
            restrict: 'A',
            replace: true,
            scope: {
                graph: '='
            },
            template: graphTemplate,
            controller: function ($scope) {
                $scope.$on(GRAPH_EVENT.GetData, function (args) {
                    var FilterObj = {};
                    var tScope = args.targetScope;
                    FilterObj.view = tScope.graph.defaultFilter;
                    FilterObj.fromDate = tScope.graph.fromDate ? moment(tScope.graph.fromDate).format('YYYY/MM/DD') : tScope.graph.fromDate;
                    FilterObj.toDate = tScope.graph.toDate ? moment(tScope.graph.toDate).format('YYYY/MM/DD') : tScope.graph.toDate;

                    if (FilterObj.fromDate && FilterObj.toDate && (moment(tScope.graph.toDate).diff(moment(tScope.graph.fromDate)) < 0) ){
                        $.alert('FromDate should be less than or equal to ToDate');
                        return false;
                    }
                    FilterObj.customFilter = [];
                    $.each(tScope.graph.filters, function (i, f) {
                        var obj = {};
                        obj.name = f.name;
                        obj.value = f.type == 'Datepicker' ? (f.value ? moment(f.value).format('YYYY/MM/DD') : "") : f.value;
                        (typeof obj.value == 'string') && (obj.value = [obj.value]);
                        if (f.value)
                            FilterObj.customFilter.push(obj);
                    });

                    if (!tScope.graph.dataUrl)
                        $scope.$broadcast(GRAPH_EVENT.Draw);
                    else {
                        $scope.isLoading = true;
                        GraphService(tScope.graph.dataUrl).get({ sp: tScope.graph.sp, filters: JSON.stringify(FilterObj) }).$promise.then(function (data) {
                            var rData = [];
                            if (data.length) {
                                $.each(data, function (i, d) {
                                    if (i == 0) {
                                        var cols = [];
                                        for (var c in d) {
                                            if(typeof d[c]!= 'function')
                                            cols.push(c);
                                        }
                                        rData.push(cols);
                                    }
                                    var row = [];
                                    $.each(rData[0], function (j, r) {
                                        row.push(d[r]);
                                    });
                                    rData.push(row);
                                });
                            }                            
                            tScope.graph.data = rData;
                            $scope.isLoading = false;
                        }).catch(function () {
                            tScope.graph.data = [];
                            $scope.isLoading = false;
                        });
                    }
                });

                $scope.resetFilter = function () {
                    $scope.graph.selectedFilterSet = [];
                    $scope.graph.filters = [];
                    $scope.applyFilter();
                }
            },
            link: function (scope, element, attrs) {
                scope.graph = scope.graph || {};
                scope.graph.data = scope.graph.data || [];
                scope.graph.filters = scope.graph.filters || {};
                scope.graph.options = scope.graph.options || {};
                scope.graph.defaultFilter = scope.graph.defaultFilter || 'month';
                scope.graph.fromDate = scope.graph.fromDate || '';
                scope.graph.toDate = scope.graph.toDate || '';
                scope.graph.filterSet = [];
                scope.graph.selectedFilterSet = [];

                scope.initFilters = function () {
                    $.each(scope.graph.filters, function (i, filter) {
                        filter.data = filter.data || [];

                        if (filter.dataUrl) {
                            $http.get(filter.dataUrl).success(function (resultData) {
                                filter.data = resultData;
                            });
                        }
                    });
                };                

                if (scope.graph.filterUrl) {
                    $http.get(scope.graph.filterUrl).success(function (resultData) {
                        scope.graph.filterSet = resultData;                        
                    });
                }
                else
                    scope.initFilters();

                //filter set change
                scope.$watch(function () {
                    return scope.graph.selectedFilterSet;
                }, function (ov, nv) {
                    if (ov != nv) {                        
                        var copyFilter = $.extend(true, [], scope.graph.filters);
                        scope.graph.filters = [];
                        if (typeof scope.graph.selectedFilterSet == 'string')
                            scope.graph.selectedFilterSet = [scope.graph.selectedFilterSet];
                        $.each(scope.graph.selectedFilterSet, function (index, filter) {
                            var sFilter = $.extend(true, {}, scope.graph.filterSet[+filter]);
                            
                            $.each(copyFilter, function (i, f) {
                                if (f.name == sFilter.name)
                                    sFilter.value = f.value;
                            });
                            scope.graph.filters.push(sFilter);
                        });
                        scope.initFilters();
                    }
                }, true);

                //data change
                scope.$watch(function () {
                    return {
                        data:  scope.graph.data
                    }
                }, function (ov, nv) {
                    if (ov != nv)
                        scope.$broadcast(GRAPH_EVENT.Draw);
                }, true);

                scope.applyFilter = function () {
                    scope.$broadcast(GRAPH_EVENT.FilterChanged);
                };

                //default filter and option change
                scope.$watch(function () {
                    if (scope.graph) {
                        var filterArr = [];
                        $.each(scope.graph.filters, function (i, f) {
                            filterArr.push(f.value);
                        });
                        return {
                            options: scope.graph.options,
                            defaultFilter: scope.graph.defaultFilter                           
                        };
                    }
                    return scope.graph;
                }, function (ov, nv) {
                    if (ov != nv)
                        scope.applyFilter();
                }, true);
            }
        };
    });

    angular.module('glams.ui.chart.linechart', [])
        .directive('lineChart', function (GraphService, googleChartApiPromise, GRAPH_EVENT) {
            var template = ['<div>', '</div>'].join('');
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    graph: '=lineChart'
                },
                template: template,
                controller: function ($scope) {
                    $scope.$on(GRAPH_EVENT.FilterChanged, function (args) {
                        $scope.$emit(GRAPH_EVENT.GetData);
                    });

                    $scope.$on(GRAPH_EVENT.Draw, function (args) {
                        google.visualization && $scope.Draw();
                    });

                    $scope.Draw = function () {
                        if (!$scope.graph.data.length)
                            return;
                        var data = google.visualization.arrayToDataTable($scope.graph.data);
                        var chart = new google.visualization.LineChart($scope.container);
                        chart.draw(data, $scope.graph.options);
                    };

                    $(window).on('resize', function () {
                        google.visualization && $scope.Draw();
                    });

                    googleChartApiPromise.then(function () {
                        $scope.$emit(GRAPH_EVENT.GetData);
                    });
                },
                link: function (scope, element, attrs) {
                    scope.container = element.get(0);
                }
            };
        });

    angular.module('glams.ui.chart.barchart', [])
    .directive('barChart', function (GraphService, googleChartApiPromise, GRAPH_EVENT) {
        var template = ['<div>', '</div>'].join('');
        return {
            restrict: 'A',
            replace: true,
            scope: {
                graph: '=barChart'
            },
            template: template,
            controller: function ($scope) {
                $scope.$on(GRAPH_EVENT.FilterChanged, function (args) {
                    $scope.$emit(GRAPH_EVENT.GetData);
                });

                $scope.$on(GRAPH_EVENT.Draw, function (args) {
                    google.visualization && $scope.Draw();
                });

                $scope.Draw = function () {
                    if (!$scope.graph.data.length)
                        return;
                    var data = google.visualization.arrayToDataTable($scope.graph.data);
                    var chart = new google.visualization.BarChart($scope.container);
                    chart.draw(data, $scope.graph.options);
                };

                $(window).on('resize', function () {
                    google.visualization && $scope.Draw();
                });

                googleChartApiPromise.then(function () {
                    $scope.$emit(GRAPH_EVENT.GetData);
                });
            },
            link: function (scope, element, attrs) {
                scope.container = element.get(0);
            }
        };
    });

})(jQuery, angular, window);