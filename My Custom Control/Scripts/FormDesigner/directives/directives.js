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
        if (scope.Item && ((scope.Item.Type != TOOL.BLOCK.COLUMN) && (scope.Item.Type != TOOL.DEFAULT.RESIZER) && (scope.Item.Type != TOOL.BLOCK.TAB))) {
            $(element).parent().sortable({
                helper: 'clone',
                cancel: '[contenteditable="true"], .CustomControl [sortable]',
                start: function (event, ui) {
                    ui.item.data('start', ui.item.index());
                },
                update: scope.sortHandler
            });
        }
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
            enablekeyboard: false
        });
    };
});

//validate empty form name
APP.directive('nameRequired', function ($document) {
    return function (scope, element, attrs) {
        element.bind('blur', function () {
            var value = $(this).val();
            value = $.trim(value); //.replace(/[\s]/g, ''));
            if (value == '') {
                value = 'InputName_' + scope.$id;
            }
            scope.$apply(function () {
                scope.Data.Properties.Name = value;
            });
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
                var maxlen = attrs.maxlength ? attrs.maxlength : 50;
                var value = $.trim(elm.text()).substr(0, maxlen);
                value = (value == '' ? 'Untitled' : value);
                scope.Item.Properties.Name = value;
                scope.$apply();
            });

            ctrl.$render = function () {
                elm.html(ctrl.$viewValue);
            };
        }
    };
});

APP.directive('ngSize', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (!element.nodeName === 'SELECT') {
                return;
            }
            attrs.$observe('ngSize', function setSize(value) {
                attrs.$set('size', attrs.ngSize);
            });
        }
    }
});

/*model popup*/
APP.directive('modelWindow', function () {
    return {
        restrict: 'EA',
        transclude: true,
        controller: function ($scope, $element, $timeout, $rootScope) {

        },
        link: function (scope, elm, attrs, ctrl) {
            var prop = {};

            prop.width = attrs.width || 300;
            prop.height = attrs.height || 300;

            scope.content = attrs.content;
            scope.title = attrs.title;

            var popup = $(elm);
            var close = popup.find('.close-btn');
            var popupwindow = popup.find('.popup');
            var popupcontent = popup.find('.popup-content');
            var popupfoot = popup.find('.popup-foot');
            var popuphead = popup.find('.popup-head');

            setTimeout(function () {
                popupcontent.find('input').eq(0).focus();
            }, 200);

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
            popupwindow.height(prop.height-30);

            $(window).resize(function () {
                var lc = $(window).width() / 2 - popupwindow.width() / 2;
                var tc = $(window).height() / 2 - popupwindow.height() / 2;

                popupwindow.css({ 'left': lc + 'px', top: tc + 'px' });
            }).resize();

            //popupcontent.height(popupwindow.outerHeight() - popupfoot.outerHeight() - popuphead.height() - 66);

        },
        template: '<div class="popup-wrapper">' +
                    '<div class="popup">' +
                        '<div class="popup-head">' +
                            '<i class="fa fa-lg fa-edit"></i> {{title}}' +
                            '<a href="" class="popup-close close-btn">&times;</a>' +
                        '</div>' +
                        '<div class="popup-content" ng-include="content"></div>' +
                        '<div class="popup-foot" ng-transclude></div>' +
                    '</div>' +
                 '</div>'
    }
});

/* Form Designer Directives */
APP.directive('contextMenu', function () {
    var menu = '<div class = "' + CONTEXTMENU + '">';
    menu = menu + '<ul> ';
    menu = menu + '<li class="text-option">';
    menu = menu + '<a class="mbtn alignLeftBtn" ng-click="GroupPanel.alignLeft($event)"></a>';
    menu = menu + '</li>';
    menu = menu + '<li class="text-option">';
    menu = menu + '<a class="mbtn alignCenterBtn" ng-click="GroupPanel.alignCenter($event)"></a>';
    menu = menu + '</li>';
    menu = menu + '<li class="text-option">';
    menu = menu + '<a class="mbtn alignRightBtn" ng-click="GroupPanel.alignRight($event)"></a>';
    menu = menu + '</li>';
    menu = menu + '<li> ';
    menu = menu + '<a class="mbtn editRolesBtn" ng-click="editRoles($event)"></a>';
    menu = menu + '</li>';
    menu = menu + '<li> ';
    menu = menu + '<a class="mbtn editVisibilityBtn" ng-class="{invisible:!Item.Properties.Visible}" ng-click="editVisibility($event)"></a>';
    menu = menu + '</li>';
	menu = menu + '<li> ';
    menu = menu + '<a class="mbtn clearBtn" ng-click="clearElement($event)"></a>';
    menu = menu + '</li>';
    menu = menu + '<li>';
    menu = menu + '<a class="mbtn delBtn" ng-click="removeElement($event)"></a>';
    menu = menu + '</li>';
    menu = menu + '</ul>';
    menu = menu + '</div>';
    return {
        restrict: 'E',
        transclude: true,
        scope: false,
        controller: function ($scope, $element, $timeout) {
            
            $scope.clearElement = function (event) {
                var cScope = $scope.getElementScope(event.target);
                switch (cScope.Item.Type) {
                    case TOOL.BLOCK.TABS:
                    case TOOL.BLOCK.ROW:
                        $.each(cScope.Item.Items, function () {
                            this.Items = [];
                        });
                        break;
                    case TOOL.BLOCK.PARAGRAPH:
                        cScope.Item.Properties.Text = "Untitled";
                        break;
                    default:
                        cScope.Item.Items = []
                        break;
                }
            };
			
            $scope.removeElement = function (event) {
                var cScope = $scope.getElementScope(event.target);
                var p = cScope.$parent.$parent;
                var pItem = p.Items;
                var index = $.inArray(cScope.Item, pItem);
                switch (cScope.Item.Type) {
                    case TOOL.BLOCK.COLUMN:
                        if (pItem.length > 1) {
                            if (index == 0)
                                pItem.splice(index, 2);
                            else
                                pItem.splice(index - 1, 2);

                            var n = (pItem.length + 1) / 2;
                            var w = 100 / n;
                            $.each(pItem, function (i) {
                                if (i % 2 == 0)
                                    this.Style.width = w + '%';
                            });
                            $timeout(function () {
                                $scope.$parent.screenResizeHandler();
                            }, 30);
                        } else {
                            p.$parent.$parent.$parent.Items.splice(p.$parent.$index, 1);
                        }
                        break;
                    default:
                        pItem.splice(index, 1);
                        break;
                }
            };

            $scope.GroupPanel = {
                alignLeft: function (event) {
                    var cScope = $scope.getElementScope(event.target);
                    cScope.Item.Properties.Align = "left";
                },
                alignCenter: function (event) {
                    var cScope = $scope.getElementScope(event.target);
                    cScope.Item.Properties.Align = "center";
                },
                alignRight: function (event) {
                    var cScope = $scope.getElementScope(event.target);
                    cScope.Item.Properties.Align = "right";
                }
            };

            $scope.getElementScope = function (el) {
                var elm = $(el).parents('.' + CONTEXTMENU).parent();
                return angular.element(elm).scope();
            };
			
			$scope.editRoles = function(event){
			    var cScope = $scope.getElementScope(event.target);
				cScope.Roles.Edit(cScope.Item.Properties);
			};

			$scope.editVisibility = function (event) {
			    var cScope = $scope.getElementScope(event.target);
			    cScope.Item.Properties.Visible = !cScope.Item.Properties.Visible;
			};
        },
        link: function (scope, elm, attrs) {

        },
        template: menu,
        replace: true
    }
});

APP.directive('vtabs', function () {
    var template = '';
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function ($scope, $element) {
            var panes = $scope.panes = [];

            $scope.select = function (pane) {
                var formDesigner = $('.form-designer');
                var p = $($element).parents('.form-tools');
                if (pane.selected == true && p.width() > 10) {
                    var elm = p.find('.vtab-contents').hide();
                    p.animate({
                        width: '10px'
                    }, {
                        complete: function () {
                            if (elm.is(':visible'))
                                elm.hide();
                        },
                        progress: function () {
                            $scope.$parent.screenResizeHandler();
                        }
                    });
                    p.find('.IETransformContainer').animate({
                        'left': '-115px'
                    });
                    formDesigner.animate({
                        'margin-left': '30px'
                    });
                } else {
                    p.animate({
                        width: '300px'
                    }, {
                        complete: function () {
                            p.find('.vtab-contents').show();
                        },
                        progress: function () {
                            $scope.$parent.screenResizeHandler();
                        }
                    });
                    p.find('.IETransformContainer').animate({
                        left: '175px'
                    }, function () {
                        p.find('.vtab-contents').show();
                    });

                    formDesigner.animate({
                        'margin-left': '320px'
                    });
                    angular.forEach(panes, function (pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                }
            }

            this.addPane = function (pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            }
        },
        link: function (scope, element, attrs) {

        },
        template: '<div><ul class="vtabs">' + '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}" ng-click="select(pane)">{{pane.name}}</li>' + '</ul><div class="vtab-contents" ng-transclude></div></div>',
        replace: true
    };
});

APP.directive('vpane', function () {
    return {
        require: '^vtabs',
        restrict: 'E',
        transclude: true,
        scope: {
            'class': '@',
            'name': '@'
        },
        link: function (scope, element, attrs, tabsCtrl) {
            tabsCtrl.addPane(scope);
        },
        template: '<div class="vtab-content" ng-class="{active: selected}"><div scrollable ng-transclude>' + '</div></div>',
        replace: true
    };
});

/*form properties*/
APP.directive('properties', function ($http) {
    var template = '';
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        controller: function ($scope, $element, $rootScope, $timeout) {
            $scope.container = '.property-container';
            $scope.init = function () {
                $rootScope.$$childHead.PropertyScope = $scope;
            };

            $scope.editRoles = function ($event, Column) {
                var model = Column || $scope.Data.Properties;
				$rootScope.$$childHead.Roles.Edit(model);
            };

            $scope.toggle = function () {
                if (!$scope.Active) {
                    $($scope.container).hide();
                    $($element).animate({
                        width: '10px'
                    });
                } else {
                    $($element).animate({
                        width: '300px'
                    }, function () {
                        $($scope.container).show();
                    });
                }
            };

            $scope.removeItem = function () {
                var index = $.inArray($scope.Data, $scope.DataParent);
                $scope.DataParent.splice(index, 1);
                $scope.Template = "";
                $scope.DataParent = {};
                $scope.Data = {};
                $scope.Active = false;
            };

            $scope.ButtonGroup = {
                addButton: function (index) {
                    $scope.Data.Properties.Buttons.splice(index + 1, 0, CREATE.Button());
                    $scope.updateLayout();
                },
                deleteButton: function (index) {
                    if ($scope.Data.Properties.Buttons.length > 1) {
                        $scope.Data.Properties.Buttons.splice(index, 1);
                        $scope.updateLayout();
                    }
                }
            };

            $scope.Radio = {
                addOption: function (index) {
                    $scope.Data.Properties.Options.splice(index + 1, 0, CREATE.Radio());
                    $scope.Radio.Checked(index);
                },
                deleteOption: function (index) {
                    if ($scope.Data.Properties.Options.length > 2) {
                        $scope.Data.Properties.Options.splice(index, 1);
                    }
                    $scope.Radio.Checked(index);
                },
                Checked: function (index) {
                    $.each($scope.Data.Properties.Options, function (i) {
                        this.Checked = i == index ? true : false;
                    });
                    $scope.updateLayout();
                }
            };

            $scope.Checkbox = {
                addOption: function (index) {
                    $scope.Data.Properties.Options.splice(index + 1, 0, CREATE.Checkbox());
                    $scope.updateLayout();
                },
                deleteOption: function (index) {
                    if ($scope.Data.Properties.Options.length > 1) {
                        $scope.Data.Properties.Options.splice(index, 1);
                        $scope.updateLayout();
                    }
                }
            };

            $scope.Select = {
                addOption: function (index) {
                    $scope.Data.Properties.Options.splice(index + 1, 0, CREATE.Option());
                    $scope.updateLayout();
                },
                deleteOption: function (index) {
                    if ($scope.Data.Properties.Options.length > 1) {
                        $scope.Data.Properties.Options.splice(index, 1);
                        $scope.updateLayout();
                    }
                },
                Selected: function (index) {
                    if (!$scope.Data.Properties.Multiple) {
                        $.each($scope.Data.Properties.Options, function (i) {
                            this.Selected = (i == index ? true : false);
                        });
                    }
                },
                resetSelection: function () {
                    if (!$scope.Data.Properties.Multiple) {
                        $.each($scope.Data.Properties.Options, function (i) {
                            this.Selected = (i == 0 ? true : false);
                        });
                    }
                }
            };

            $scope.ManagedDataCntl = {
                getValueList: function () {
                    var mdata = $scope.ManagedDataCntl.getByName($scope.Data.Properties.Value);
                    if (mdata) {
                        $http({
                            method: 'GET',
                            url: path + 'api/Service/GetGroupsByID?id=' + mdata.ID,
                            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
                        }).success(function (data, status, headers, config) {
                            $scope.Data.DefaultList = data;
                        });
                    }
                    else {
                        $scope.Data.DefaultList = [];
                    }
                },
                getByName: function (name) {
                    var mdata = null;
                    $.each($scope.ManagedData, function (i, m) {
                        if (m.Name == name)
                            mdata = m;
                    });
                    return mdata;
                },
                EditDefaults: function () {
                    var model = $scope.Data;
                    $rootScope.$$childHead.ManagedDataDefaults.Edit(model);
                }
            };

            $scope.editValidation = function () {
                var model = $scope.Data;
                $rootScope.$$childHead.Validation.Edit(model);
            };

            $scope.getCascadeList = function () {
                var list = [];
                (function iterate(items) {
                    $.each(items, function (i, item) {
                        ((item.Type == TOOL.INPUT.MANAGEDDATA || item.Type == TOOL.INPUT.MANAGEDDATAGROUP || TOOL.INPUT.USERS) && item.Properties.Name && item.Properties.Name != $scope.Data.Properties.Name) && list.push(item.Properties.Name);
                        item.Items.length && iterate(item.Items);
                    });
                })($rootScope.$$childHead.Items);

                return list;
            }

            $scope.updateLayout = function () {
                $($scope.container).getNiceScroll().resize();
                $('body').getNiceScroll().resize();
            };
            
            $scope.DataParent = {};
            $scope.Data = {};
            $scope.Template = "";

            $scope.Active = false;

            $scope.$watch('Active', function () {
                $scope.toggle();
            });

            $scope.$watch('Data.Properties.Name', function (oldValue, newValue) {
                if ($scope.Data.Type == TOOL.INPUT.ITEMINFO) {
                    $scope.Data.Properties.Label = $scope.Data.Properties.Name ? $scope.Data.Properties.Name : 'Item Info';
                }
            });

            $scope.$watch('Data.Properties.Value', function (oldValue, newValue) {
                if ($scope.Data.Type == TOOL.INPUT.MANAGEDDATA) {
                    $scope.Data.Properties.Name = $scope.Data.Properties.Label = $scope.Data.Properties.Value ? $scope.Data.Properties.Value : 'ManagedDataName';
                    $scope.ManagedDataCntl.getValueList();
                }
            });
        },
        link: function (scope) {

        },
        template: '<div class="properties"><a class="toggleBtn" ng-click="Active=!Active"></a><div ng-init="init()" scrollable class="property-container" ng-model="Data.Properties" ng-include="Template"></div></div>',
        replace: true
    };
});


/*form tools*/
/* Form Designer Directives */
APP.directive('tools', function () {
    var template = '';
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            'name': '@',
            'type': '@'
        },
        controller: function ($scope, $element) {
            this.addPane = function (pane) {
                if (panes.length == 0) $scope.select(pane);
                panes.push(pane);
            }
        },
        template: '<div class="tools clearfix {{type}}">' +
            '<h2>{{name}}</h2><hr>' +
            '<ul ng-transclude></ul>' +
            '</div>',
        replace: true
    };
});

APP.directive('tool', function () {
    return {
        require: '^tools',
        restrict: 'E',
        transclude: true,
        scope: {
            'icon': '@',
            'type': '@'
        },
        link: function (scope, element, attrs, tabsCtrl) {

        },
       // template: '<li draggable="{helper: \'clone\'}"><span class="icon {{icon}}"></span><span class="name" ng-transclude></span></li>',
        template: '<li draggable="{helper: \'clone\'}"><i class="fa fa-lg {{icon}}"></i><span class="name" ng-transclude></span></li>',
        replace: true
    };
});

/*form template*/
APP.directive('template', function () {
    var template = '';
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            'name': '@'
        },
        controller: function ($scope, $element) {

        },
        template: '<div class="form-template" draggable="{helper: \'clone\'}"><span>{{name}}</span></div>',
        replace: true
    };
});

/*Form Control*/
APP.directive('formControl', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.FORM;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {
            $timeout(function () {
                $(elm).closest('.' + TOOL.BLOCK.FORM).droppable({
                    accept: '.' + TOOLS + ' li:not([type="' + TOOL.BLOCK.COLUMN + '"]),  [type="' + TOOL.DEFAULT.FORMTEMPLATE + '"]',
                    greedy: true,
                    hoverClass: "dropover",
                    drop: scope.dropHandler
                });
            }, 50);
        },
        template: '<div><div class="wrap"></div><div class="form-control" ismaster="{{Item.Properties.IsMaster}}" ng-click="loadTemplate()"><div class="form-control-head" ng-bind="Item.Properties.Name"></div></div></div>',
        replace: true
    };
});

/*tab control*/
APP.directive('tabControl', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope, $element) {
            $scope.selectTab = function (event) {
                event.stopPropagation();
                $scope.clearTabActive();
                this.Item.Properties.Active = true;
            };

            $scope.initTab = function () {
                var rScope = angular.element('.' + FORM).scope();
                if (rScope.isDropped)
                    $scope.Item.Items[0].Properties.Active = true;
                elm = $($element);
                $timeout(function () {
                    $(elm).parent().find('.' + TOOL.BLOCK.TAB).droppable({
                        accept: '.' + TOOLS + ' li:not([type="' + TOOL.BLOCK.COLUMN + '"]),  [type="' + TOOL.DEFAULT.FORMTEMPLATE + '"]',
                        greedy: true,
                        hoverClass: "dropover",
                        drop: $scope.dropHandler
                    });
                }, 50);
            };

            $scope.addTab = function (event) {
                event.stopPropagation();
                var tab = CREATE.Tab();
                this.Item.Items.push(tab);
                $scope.initTab();
                $scope.clearTabActive();
                tab.Properties.Active = true;
            }

            $scope.clearTabActive = function () {
                $.each($scope.Item.Items, function () {
                    this.Properties.Active = false;
                });
            };

            $scope.removeTab = function (event) {
                if ($scope.Item.Items.length > 1) {
                    if (confirm('Are you sure want to remove this tab?')) {
                        var index = $.inArray(this.Item, $scope.Item.Items);
                        $scope.Item.Items.splice(index, 1);
                        $scope.clearTabActive();
                        $scope.Item.Items[index == $scope.Item.Items.length ? index - 1 : index].Properties.Active = true;
                    }
                }
            };

            $scope.editRoles = function (Item) {
                $rootScope.$$childTail.Roles.Edit(Item.Properties);
            };
        },
        link: function (scope, elm, attrs, ctrl) {
            scope.initTab();
        },
        template: '<div class="tab-container"><ul>' +
            '<li ng-repeat="Item in Item.Items" ng-click="selectTab($event)" ng-class="{active:Item.Properties.Active}">' +
            '<span ng-model="Item.Properties.Name" maxlength="30" contenteditable="true">{{Item.Properties.Name}}</span> ' +
            '<span class="icon edit-tab-role" ng-click="editRoles(Item)"></span>' +
            '<span class="icon del-tab" ng-click="removeTab($event)"></span>' +
            '</li>' +
            '<li class="add-tab" ng-click="addTab($event)">+</li></ul>' +
            '</div>',
        replace: true
    };
});

/* section control*/
APP.directive('sectionControl', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $element) { },
        link: function (scope, elm, attrs, ctrl) {
            $(elm).click(function (e) {
                e.stopPropagation();
            });
            $(elm).find('.toggle').click(function (e) {
                e.stopPropagation();
                $(elm).closest('.' + TOOL.BLOCK.SECTION).toggleClass('toggled');
            });
            $timeout(function () {
                $(elm).closest('.' + TOOL.BLOCK.SECTION).droppable({
                    accept: '.' + TOOLS + ' li:not([type="' + TOOL.BLOCK.COLUMN + '"]),  [type="' + TOOL.DEFAULT.FORMTEMPLATE + '"]',
                    greedy: true,
                    hoverClass: "dropover",
                    drop: scope.dropHandler
                });
            }, 50);
        },
        template: '<div class="section-head" ng-class="{active: Item.Properties.Active}">' +
            '<span contenteditable="true" maxlength="50" ng-model="Item.Properties.Name"></span>' +
            '<span class="toggle"></span>' +
            '</div>',
        replace: true
    };
});

/*paragraph*/
APP.directive('paragraph', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $element) { },
        link: function (scope, elm, attrs, ctrl) {
            elm.find('.inline-text').click(function (e) {
                e.stopPropagation();
            });
        },
        template: '<div><span class="inline-text" contenteditable="true" maxlength="200" ng-model="Item.Properties.Name" maxlength="250"></span></div>',
        replace: true
    };
});

/*Form Fields*/
APP.directive('grids', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.GRID;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="CustomControl input-template" ng-click="loadTemplate()" class="grid-control">' +
            '<span class="fa fa-lg fa-table"> </span><span> Grid Control</span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('textbox', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.TEXTBOX;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<label>{{Item.Properties.Label}}</label>' +
            '<input type="text" name="{{Item.Properties.Name}}" size="{{Item.Properties.Size}}" maxlength="{{Item.Properties.MaxLength}}" placeholder="{{Item.Properties.WaterMarkText}}" ng-model="Item.Properties.Value" />' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('password', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.PASSWORD;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<label>{{Item.Properties.Label}}</label>' +
            '<input type="password" name="{{Item.Properties.Name}}" size="{{Item.Properties.Size}}" maxlength="{{Item.Properties.MaxLength}}" placeholder="{{Item.Properties.WaterMarkText}}" ng-model="Item.Properties.Value" />' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('date', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.DATE;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<label>{{Item.Properties.Label}}</label>' +
            '<input type="text" name="{{Item.Properties.Name}}" size="{{Item.Properties.Size}}" maxlength="{{Item.Properties.MaxLength}}" placeholder="{{Item.Properties.WaterMarkText}}" ng-model="Item.Properties.Value" />&nbsp;<span class="icon icon-date"></span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('textArea', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.TEXTAREA;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<label>{{Item.Properties.Label}}</label>' +
            '<textarea name="{{Item.Properties.Name}}" cols="{{Item.Properties.Columns}}" maxlength="{{Item.Properties.MaxLength}}" rows="{{Item.Properties.Rows}}" placeholder="{{Item.Properties.WaterMarkText}}" ng-model="Item.Properties.Value" ></textarea>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('fileupload', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.FILEUPLOAD;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<label>{{Item.Properties.Label}}</label>' +
            '<input type="file" name="{{Item.Properties.Name}}" accept="{{Item.Properties.Accept}}" ng-model="Item.Properties.Value"/>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('buttonInput', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.TaskTemplates = $rootScope.$$childHead.taskTemplates;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.BUTTON;
                pScope.ValidationGroup = $rootScope.$$childHead.Form.ValidationGroups;
                pScope.Data.selectedValidationGroup = $scope.Item.ValidationGroups.toString();

                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<a type="{{Item.Properties.Type}}" name="{{Item.Properties.Name}}" ng-bind="Item.Properties.Value"></a>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('hidden', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.HIDDEN;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<input type="hidden" name="{{Item.Properties.Name}}" value="{{Item.Properties.Value}}"/>' +
            '<i class="fa fa-eye-slash"></i> <span class="small-text">Hidden Input</span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('radioGroup', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.RADIOGROUP;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<label>{{Item.Properties.Label}}</label>' +
            '<div class="input-group">' +
            '<label ng-repeat="option in Item.Properties.Options">' +
            '<input type="radio" value="{{option.value}}" name="{{Item.Properties.Name}}" ng-checked="option.Checked"/> {{option.Label}}' +
            '</label>' +
            '</div>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('singleCheckbox', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.SINGLECHECKBOX;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<div class="input-group">' +
            '<label>' +
            '<input type="checkbox" value="{{option.value}}" name="{{Item.Properties.Name}}" ng-checked="option.Checked"/> {{Item.Properties.Label}}' +
            '</label>' +
            '</div>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('checkboxGroup', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {

                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.CHECKBOXGROUP;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<label>{{Item.Properties.Label}}</label>' +
            '<div class="input-group">' +
            '<label ng-repeat="option in Item.Properties.Options">' +
            '<input type="checkbox" value="{{option.value}}" name="{{Item.Properties.Name}}" ng-checked="option.Checked"/> {{option.Label}}' +
            '</label>' +
            '</div>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('selectBox', function ($timeout, $http) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.SELECT;
                pScope.Active = true;
            };

            if ($scope.Item.Properties.DataUrl) {
                $http.get(path + $scope.Item.Properties.DataUrl, {
                    headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
                }).success(function (data) {
                    var selected = [];
                    $.each($scope.Item.Properties.Options, function () {
                        this.Selected && selected.push(this.Text);
                    });
                    $scope.Item.Properties.Options = [];
                    $.each(data, function (i, d) {
                        $scope.Item.Properties.Options.push({
                            Text: d.Name,
                            Selected: $.inArray(d.Name, selected) >= 0,
                        });
                    });
                });
            }
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="input-template" ng-click="loadTemplate()">' +
            '<label>{{Item.Properties.Label}}</label>' +
            '<select ng-size="{{Item.Properties.Size}}" name="{{Item.Properties.Name}}" ng-if="!Item.Properties.Multiple">' +
            '<option ng-repeat="option in Item.Properties.Options track by $index" value="{{option.Text}}" ng-selected="option.Selected">{{option.Text}}</option>' +
            '</select>' +
            '<select ng-size="{{Item.Properties.Size}}" name="{{Item.Properties.Name}}" ng-if="Item.Properties.Multiple" multiple="multiple">' +
            '<option ng-repeat="option in Item.Properties.Options track by $index" value="{{option.Text}}" ng-selected="option.Selected">{{option.Text}}</option>' +
            '</select>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('customControl', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.CUSTOMCONTROL;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="CustomControl input-template" ng-click="loadTemplate()">' +
            '<i class="fa fa-lg fa-sun-o"></i> <span>{{Item.Properties.Name}}</span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('managedData', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.ManagedData = $rootScope.$$childHead.managedData
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.MANAGEDDATA;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="CustomControl input-template" ng-click="loadTemplate()">' +
            '<i class="fa fa-lg fa-cog"></i> <span>{{Item.Properties.Value}} ({{Item.Properties.Label}})</span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('managedDataGroup', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.ManagedData = $rootScope.$$childHead.managedData
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.MANAGEDDATAGROUP;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="CustomControl input-template" ng-click="loadTemplate()">' +
            '<i class="fa fa-lg fa-cogs"></i> <span>{{Item.Properties.Label}} <span ng-if="Item.Properties.Defaults.length">({{Item.Properties.Defaults.toString()}})</span></span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('users', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.ManagedData = $rootScope.$$childHead.managedData
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.USERS;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="CustomControl input-template" ng-click="loadTemplate()">' +
            '<i class="fa fa-lg fa-users"></i> <span>{{Item.Properties.Label}}</span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('itemInfo', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.ItemInfo = $rootScope.$$childHead.itemInfo;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.ITEMINFO;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="CustomControl input-template" ng-click="loadTemplate()">' +
            '<i class="fa fa-lg fa-info-circle"></i> <span>{{Item.Properties.Name}} ({{Item.Properties.Label}})</span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('itemInfoCollection', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.ItemInfo = $rootScope.$$childHead.itemInfo;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.ITEMINFOCOLLECTION;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="CustomControl input-template" ng-click="loadTemplate()">' +
            '<div ng-if="!Item.Properties.Defaults.length"><i class="fa fa-lg fa-info-circle"></i> <span> (Item Info Collection)</span></div>' +
            '<div ng-repeat="opt in Item.Properties.Defaults">' +
            '<i class="fa fa-lg fa-info-circle"></i> <span> {{opt}}</span>' +
            '<br/><br/>' +
            '</div>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

APP.directive('barcode', function ($timeout) {
    return {
        require: 'ngModel',
        restrict: 'E',
        transclude: true,
        controller: function ($scope, $rootScope) {
            $scope.loadTemplate = function () {
                var pScope = $rootScope.$$childHead.PropertyScope;
                pScope.Data = $scope.Item;
                pScope.BarcodeTypes = $rootScope.$$childHead.barcodeTypes;
                pScope.DataParent = $scope.$parent.$parent.$parent.Item.Items;
                pScope.Template = TEMPLATE.BARCODE;
                pScope.Active = true;
            };
        },
        link: function (scope, elm, attrs, ctrl) {

        },
        template: '<div class="CustomControl input-template" ng-click="loadTemplate()">' +
            '<i class="fa fa-lg fa-barcode"></i> <span>{{Item.Properties.Label}}</span>' +
            '<div class="wrapper"></div>' +
            '</div>',
        replace: true
    };
});

/*onfinish renderer*/
APP.directive('onFinishRender', function ($timeout, $compile) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            var rScope = angular.element('.' + FORM).scope();
            switch (scope.Item.Type) {
                case TOOL.BLOCK.ROW:
                    $(element).droppable({
                        accept: '[type="' + TOOL.BLOCK.COLUMN + '"]',
                        greedy: true,
                        hoverClass: "dropover",
                        drop: rScope.dropHandler
                    });
                    break;

                case TOOL.BLOCK.COLUMN:
                    $(element).droppable({
                        accept: '.' + TOOLS + ' li:not([type="' + TOOL.BLOCK.COLUMN + '"]), [type="' + TOOL.DEFAULT.FORMTEMPLATE + '"]',
                        greedy: true,
                        hoverClass: "dropover",
                        drop: scope.dropHandler
                    });
                    if (rScope.isDropped) {
                        var cAll = element.parent().children('.' + TOOL.BLOCK.COLUMN);
                        cAll.push($(element));
                        var w = (100 / cAll.length);
                        cAll.each(function () {
                            angular.element(this).scope().Item.Style.width = w + '%';
                        });
                        if (cAll.length > 1) {
                            scope.$parent.$parent.Items.splice(-1, 0, CREATE.Resizer());
                        }
                    }
                    scope.rePositionResizer();
                    break;

                case TOOL.BLOCK.FORM:
                    var fScope = angular.element(element).scope();
                    fScope.Item.Properties.Name = fScope.Item.Properties.Name == '' ? 'FormName_' + fScope.$id : fScope.Item.Properties.Name;
                    var el = $compile('<form-control ng-model="Item"></form-control>')(scope);
                    $(element).prepend(el);
                    break;

                case TOOL.DEFAULT.RESIZER:
                    resizer = $(element);
                    resizer.mousedown(function () {
                        var x1 = $(this).prev().offset().left + 60;
                        var x2 = $(this).next().offset().left + $(this).next().width() - 40;

                        var offset1 = $(this).prev().find('.' + TOOL.BLOCK.COLUMN).length;
                        var offset2 = $(this).next().find('.' + TOOL.BLOCK.COLUMN).length;

                        $(this).draggable('option', 'containment', [x1 + 60 * offset1, 0, x2 - 60 * offset2, 0]);
                    });
                    resizer.draggable({
                        axis: 'x',
                        drag: function (event, ui) {
                            var parent = $(this).closest('.' + TOOL.BLOCK.ROW);
                            var prev = $(this).prev();
                            var next = $(this).next();
                            var pw = 0,
                                nw = 0;
                            var nAll = next.nextAll('.' + TOOL.BLOCK.COLUMN);
                            var pAll = prev.prevAll('.' + TOOL.BLOCK.COLUMN);
                            nAll.each(function () {
                                nw = nw + $(this).outerWidth();
                            });
                            pAll.each(function () {
                                pw = pw + $(this).outerWidth();
                            });

                            prev.outerWidth((ui.position.left - 10) - pw);
                            next.outerWidth((parent.width() - prev.outerWidth()) - nw - pw);
                            scope.rePositionResizer();
                        },
                        stop: function () {
                            var cW = $(this).parent().width();
                            var c = $(this).parent().children('.' + TOOL.BLOCK.COLUMN);
                            c.each(function () {
                                var w = parseFloat($(this).css('width'));
                                angular.element(this).scope().Item.Style.width = ((w * 100 / cW) + '%');
                                $timeout(function () {
                                    scope.rePositionResizer();
                                }, 20);
                            });
                            scope.$apply();
                        }
                    });

                    $timeout(function () {
                        scope.rePositionResizer();
                    }, 20);
                    break;

                case TOOL.BLOCK.GROUPPANEL:
                    $(element).droppable({
                        accept: '.' + TOOLS + '.formtools li,.customtools li',
                        greedy: true,
                        hoverClass: "dropover",
                        drop: rScope.dropHandler
                    });
                    break;

                case TOOL.BLOCK.PARAGRAPH:
                    var el = $compile('<paragraph ng-model="Item"></paragraph>')(scope);
                    $(element).append(el);
                    break;

                case TOOL.BLOCK.TABS:
                    var el = $compile('<tab-control ng-model="Item"></tab-control>')(scope);
                    $(element).prepend(el);
                    break;

                case TOOL.BLOCK.SECTION:
                    var el = $compile('<section-control ng-model="Item"></section-control>')(scope);
                    $(element).prepend(el);
                    break;

                case TOOL.BLOCK.LINEBREAK:
                    $(element).append('<hr/>');
                    break;

                case TOOL.INPUT.GRID:
                    var el = $compile('<grids ng-model="Item"></grids>')(scope);
                    $(element).prepend(el);
                    break;

                case TOOL.INPUT.TEXTBOX:
                    var el = $compile('<textbox ng-model="Item" sortable></textbox>')(scope);
                    $(element).append(el);
                    break;

                case TOOL.INPUT.TEXTAREA:
                    var el = $compile('<text-area ng-model="Item" sortable></text-area>')(scope);
                    $(element).append(el);
                    break;

                case TOOL.INPUT.PASSWORD:
                    var el = $compile('<password ng-model="Item" sortable></password>')(scope);
                    $(element).append(el);
                    break;

                case TOOL.INPUT.FILEUPLOAD:
                    var el = $compile('<fileUpload ng-model="Item" sortable></fileupload>')(scope);
                    $(element).append(el);
                    break;

                case TOOL.INPUT.SELECT:
                    var el = $compile('<select-box ng-model="Item" sortable></select-box>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.DATE:
                    var el = $compile('<date ng-model="Item" sortable></date>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.BUTTON:
                    var el = $compile('<button-input ng-model="Item" sortable></button-input>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.HIDDEN:
                    var el = $compile('<hidden ng-model="Item" sortable></hidden>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.RADIOGROUP:
                    var el = $compile('<radio-group ng-model="Item" sortable></radio-group>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.SINGLECHECKBOX:
                    var el = $compile('<single-checkbox ng-model="Item" sortable></single-checkbox>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.CHECKBOXGROUP:
                    var el = $compile('<checkbox-group ng-model="Item" sortable></checkbox-group>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.CUSTOMCONTROL:
                    var el = $compile('<custom-control ng-model="Item" sortable></custom-control>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.MANAGEDDATA:
                    var el = $compile('<managed-data ng-model="Item" sortable></managed-data>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.MANAGEDDATAGROUP:
                    var el = $compile('<managed-data-group ng-model="Item" sortable></managed-data-group>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.USERS:
                    var el = $compile('<users ng-model="Item" sortable></users>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.ITEMINFO:
                    var el = $compile('<item-info ng-model="Item" sortable></item-info>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.ITEMINFOCOLLECTION:
                    var el = $compile('<item-info-collection ng-model="Item" sortable></item-info-collection>')(scope);
                    $(element).append(el);
                    break;
                case TOOL.INPUT.BARCODE:
                    var el = $compile('<barcode ng-model="Item" sortable></barcode>')(scope);
                    $(element).append(el);
                    break;
            }
            rScope.isDropped = false;
        }
    }
});