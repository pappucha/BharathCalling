var APP = angular.module('FormDesinger', ['glams.audit']);
(function ($) {
    APP.config(function ($httpProvider) {
        /*$httpProvider.defaults.headers.common = {
            'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || ""
        };*/
    });
    APP.controller('formDesingerController', ['$scope', '$http', '$compile', '$timeout', 'Audit',
    function ($scope, $http, $compile, $timeout, Audit) {
        var urlParam = window.location.href.split('/');

        $scope.Id = urlParam[urlParam.length - 1];

        $scope.container = '.' + FORM_CONTAINER;

        $scope.customControl = [];

        $scope.managedData = [];

        $scope.layoutTemplates = [];

        $scope.itemInfo = [];

        $scope.userRoles = [];

        $scope.taskTemplates = [];

        $scope.auditObject = {};

        $scope.Form = {
            Id: 'ctrl' + uuid().replace(/-/g, ''),
            Name: 'Untitled',
            UserId: '',
            Items: [],
            ValidationGroups: []
        };

        $scope.Items = $scope.Form.Items;

        $scope.isDropped = false;

        /*custom tools and templates*/
        $scope.loadCustomControls = function () {
            var serviceURL = path + 'api/form/LoadFormCustomControls';
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                $scope.customControl = data;
            });
        };

        $scope.loadManagedData = function () {
            var serviceURL = path + 'api/form/GetMasterList';
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                $scope.managedData = data;
            });
        };

        $scope.loadBarcodeTypes = function () {
            var serviceURL = path + 'api/form/GetBarcodeTypes';
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                $scope.barcodeTypes = data;
            });
        };

        $scope.loadLayoutTemplates = function () {
            var serviceURL = path + 'api/form/GetLayouts';
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                $scope.layoutTemplates = data;
            });
        };

        $scope.loadItemInfo = function () {
            var serviceURL = path + 'api/form/GetAttributeDefs';
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                $scope.itemInfo = data;
            });
        };

        //Loads Initial Data From the received Query String
        $scope.loadLayoutData = function () {
            var serviceURL = path + 'api/form/GetLayoutStore?layoutId=' + $scope.Id;
            $scope.showLoader();
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                $scope.setData(data);
                $scope.removeLoader();
            }).error(function () {
                $scope.removeLoader();
            });
        };

        $scope.loadLayoutTemplateData = function (id, item) {
            var layoutId = $scope.layoutTemplates[id].ID;
            var serviceURL = path + 'api/form/GetLayoutStore?layoutId=' + layoutId;
            $scope.showLoader();
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                var fItem = $scope.sanitizeData(data);
                $(fItem.Items).each(function (i, Item) {
                    item.push(Item);
                });
                $scope.removeLoader();
                $timeout(function () {
                    $(BODY).getNiceScroll().resize();
                }, 500);
            }).error(function () {
                $scope.removeLoader();
            });
        };

        $scope.loadUserRoles = function () {
            var serviceURL = path + 'api/form/GetRoles';
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                $scope.userRoles = data;
            });
        };

        $scope.loadTaskTemplates = function () {
            var serviceURL = path + 'api/workflow/GetTaskTemplates';
            $http({
                method: 'GET',
                url: serviceURL,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data, status, headers, config) {
                $scope.taskTemplates = data;
            });
        };

        $scope.sanitizeData = function (data) {
            data.Id = 'ctrl' + uuid().replace(/-/g, '');
            (function iterate(d) {
                if (d)
                    $.each(d, function () {
                        if (this.Id) {
                            this.Id = 'ctrl' + uuid().replace(/-/g, '');
                            if (this.Properties) {
                                if (this.Properties.Options)
                                    iterate(this.Properties.Options);
                                if (this.Properties.Buttons)
                                    iterate(this.Properties.Buttons);
                            }
                        }
                        if (this.Items && this.Items.length)
                            iterate(this.Items);
                    });
            })(data.Items);
            return data;
        };

        $scope.showLoader = function () {
            $('<div class="gif-loading"><div> </div></div>').appendTo('body');
        };

        $scope.removeLoader = function () {
            $('.gif-loading').fadeOut(function () {
                $(this).remove();
                $(BODY).getNiceScroll().resize();
            })
        };

        //setter for Form data
        $scope.setData = function (data) {
            $scope.auditObject = $.extend(true, {}, data);
            $scope.Form = data;
            $scope.Items = $scope.Form.Items;
        };

        //getter for Form data
        $scope.getData = function () {
            var formData = $.extend(true, {}, $scope.Form);
            return formData;
        };

        //showenu
        $scope.showMenu = function (elm) {
            var cScope = angular.element(elm).scope();
            var menu = $compile('<context-menu></context-menu>')(cScope);

            $(menu).appendTo(elm);
        };

        //Initialization
        $scope.init = function () {
            $scope.loadLayoutData();
            $scope.loadCustomControls();
            $scope.loadManagedData();
            $scope.loadBarcodeTypes();
            $scope.loadLayoutTemplates();
            $scope.loadItemInfo();
            $scope.loadUserRoles();
            $scope.loadTaskTemplates();

            $(document).ready(function () {
                $(BODY).niceScroll({
                    cursorborder: '#000',
                    cursorcolor: '#048f99',
                    cursorborderradius: '5px',
                    cursorwidth: '5px',
                    spacebarenabled: false,
                    enablekeyboard: false
                });

                $scope.initDroppables();
                $scope.initContextMenu();

                $(window).on('resize', $scope.screenResizeHandler);
                $scope.screenResizeHandler();
            });
        };

        //Screen Resize Handler
        $scope.screenResizeHandler = function () {
            $(BODY).getNiceScroll().resize();
            var fToolsScrollable = $('.' + FORM_TOOLS + ' [scrollable], .properties');
            fToolsScrollable.height($(window).height() - $(FOOTER).height());
            $scope.rePositionResizer();
        };

        //reset menu
        $scope.reset = function () {
            $('.' + CONTEXTMENU).remove();
            $('.' + INPUT_CONTAINER + ', .' + TOOL.BLOCK.FORM).removeClass('active');
        };

        //show menu for each input elements
        $scope.initContextMenu = function () {
            $(document).on('click', '.' + INPUT_CONTAINER + ', .form-control', function (e) {
                e.stopPropagation();
                $scope.reset();
                if ($(e.target).is('.form-control-head')) {
                    $(this).parents('.' + TOOL.BLOCK.FORM).eq(0).addClass('active');
                }
                else {
                    $(this).addClass('active');
                }
            });

            $(document).on('click', function (e) {
                var target = $(e.target);
                if (target.not('.properties *, .properties, .' + INPUT_CONTAINER + ', :button, .popup-wrapper, .popup-wrapper *').length) {
                    $scope.reset();
                    $scope.PropertyScope.Active = false;
                    $scope.$apply();
                }
            });

            $(document).on('contextmenu', '.' + TOOL.BLOCK.COLUMN + ',.' + TOOL.BLOCK.LINEBREAK + ',.' + TOOL.BLOCK.PARAGRAPH + ',.' + TOOL.BLOCK.ROW + ',.' + TOOL.BLOCK.SECTION + ',.' + TOOL.BLOCK.TABS + ',.' + TOOL.BLOCK.GROUPPANEL, function (event) {
                $scope.reset();
                event.stopPropagation();
                $scope.showMenu(this);
                return false;
            });
        };

        //repositioning resizer while screen Resized
        $scope.rePositionResizer = function () {
            $($scope.container).find('.' + TOOL.DEFAULT.RESIZER).each(function (index, elm) {
                var left = $(elm).next().offset().left - $(elm).parent().offset().left + 10;
                $(elm).css('left', left + 'px');
            });
        };

        //initialize droppable 
        $scope.initDroppables = function () {
            $('.' + FORM_CONTAINER).droppable({
                accept: '[type="' + TOOL.BLOCK.ROW + '"],[type="' + TOOL.DEFAULT.FORMTEMPLATE + '"]',
                greedy: true,
                hoverClass: DROPOVER,
                drop: $scope.dropHandler
            }).sortable({
                start: function (event, ui) {
                    ui.item.data('start', ui.item.index());
                },
                update: $scope.sortHandler
            });

        };

        //drop handler
        $scope.dropHandler = function (event, ui) {
            $scope.isDropped = true;
            var type = ui.helper.attr('type');
            var targetElm = $(event.target);
            var Item = targetElm.is($scope.container) ? angular.element(targetElm).scope().Form.Items : angular.element(targetElm).scope().Item.Items;

            if (TOOL.DEFAULT[type.toUpperCase()]) {
                $scope.loadLayoutTemplateData(ui.draggable.index() - 1, Item);
            }
            else if (TOOL.BLOCK[type.toUpperCase()] || (targetElm.closest('.' + TOOL.BLOCK.FORM).length && TOOL.INPUT[type.toUpperCase()])) {
                var tool = CREATE[type]();
                switch (type) {
                    case TOOL.INPUT.CUSTOMCONTROL:
                        var index = ui.draggable.index();
                        var cObj = $.extend(true, {}, $scope.customControl[index]);
                        tool.Properties = cObj;
                        if (cObj) {
                            if (cObj.Controls) {
                                var items = JSON.parse(cObj.Controls);
                                $.each(items, function (i, c) {
                                    c.Id = 'ctrl' + uuid().replace(/-/g, '');
                                    tool.Items.push(c);
                                });
                            }
                        }

                        break;
                }
                Item.push(tool);
            }

            $scope.$apply();
            $(BODY).getNiceScroll().resize();
            $('.' + DROPOVER).removeClass(DROPOVER);
        };

        //sort handler
        $scope.sortHandler = function (event, ui) {
            var start = ui.item.data('start'),
                end = ui.item.index();
            var p = ui.item.parent();
            var eScope = p.is($scope.container) ? angular.element(p).scope().Form : angular.element(p).scope().Item;

            eScope.Items.splice(end, 0, eScope.Items.splice(start, 1)[0]);

            $scope.$apply();
            $scope.rePositionResizer();
        };

        //save layout data
        $scope.save = function () {

            var oldAudit = $.extend(true, {}, $scope.auditObject);
            var newAudit = $.extend(true, {}, $scope.getData());

            function auditDataHelper(r) {
                r.AuditName = (r.Properties && r.Properties.Name) || r.Name;
                r.Properties && (r.Properties.AuditName = r.Properties.Name || r.Name);

                r['DefaultList'] && (delete r['DefaultList']);
                r['$$hashKey'] && (delete r['$$hashKey']);

                $.each(r.Items, function (i, t) {
                    auditDataHelper(t);
                });

                return r;
            };

            var serviceURL = path + 'api/Form/UpdateLayoutStore';
            $http.post(serviceURL, $scope.getData(), { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function () {
                Audit.log(Audit.Type.LAYOUT, oldAudit, newAudit, auditDataHelper).then(function () {
                    $scope.auditObject = newAudit;
                    $.notify('Layout saved successfully', { position: 'bottom right', type: 'success' });
                });
            }).error(function () {

            });
        };
        $scope.close = function () {
            window.parent.glams.modal.getAll()[0].close();
        };

        $scope.ShowAddWindow = function () {
            var layoutName = $scope.Form.Name;
            window.open("FormPreview.aspx?UscName=" + layoutName + "&UscType=layout");
            return false;
        };

        $scope.Roles = {
            Popup: null,
            AllRoles: [],
            SelectedRoles: [],
            CurrentItem: null,
            Edit: function (Item) {
                $scope.Roles.CurrentItem = Item;

                Item.Roles = Item.Roles || [];

                $scope.Roles.SelectedRoles = Item.Roles;

                var template = '<model-window content="Roles.html" title="Edit Roles" width="700" height="400">' +
                                    ' <a class="ctrlBtn close-btn" ng-click="Roles.Save()"><i class="icon-remove"></i> Close</a> ' +
                                '</model-window>';
                $scope.Roles.Popup = $compile(template)($scope)[0];
                angular.element('.' + FORM).append($scope.Roles.Popup);
                $scope.Roles.Init();
            },
            Init: function () {
                $scope.Roles.AllRoles = $.extend(true, {}, $scope.userRoles);
                $.each($scope.Roles.AllRoles, function (i, role) {
                    if ($.inArray(role.Name, $scope.Roles.SelectedRoles) >= 0)
                        role.selected = true;
                    else
                        role.selected = false;
                });
            },
            Check: function (role) {
                role.selected = !role.selected;
                if (role.selected)
                    $scope.Roles.SelectedRoles.push(role.Name);
                else
                    $scope.Roles.UnCheck(role);
            },
            UnCheck: function (role) {
                var index = $.inArray(role.Name, $scope.Roles.SelectedRoles);
                role.selected = false;
                if (index >= 0) {
                    $scope.Roles.SelectedRoles.splice(index, 1);
                }
            },
            Save: function () {
                $scope.Roles.CurrentItem.Roles = $scope.Roles.SelectedRoles;
                $scope.Roles.Close();
            },
            Close: function () {
                $scope.Roles.Popup.remove();
            }
        };

        $scope.ManagedDataDefaults = {
            Popup: null,
            AllRoles: [],
            SelectedRoles: [],
            CurrentItem: null,
            Edit: function (Item) {
                $scope.ManagedDataDefaults.CurrentItem = Item;

                if (!Item.Properties.Defaults) Item.Properties.Defaults = '';

                $scope.ManagedDataDefaults.SelectedList = Item.Properties.Defaults || [];

                var template = '<model-window content="MangedDataDefaults.html" title="Edit Defaults" width="700" height="400">' +
                                    ' <a class="ctrlBtn close-btn" ng-click="ManagedDataDefaults.Save()"><i class="icon-remove"></i> Close</a> ' +
                                '</model-window>';
                $scope.ManagedDataDefaults.Popup = $compile(template)($scope)[0];
                angular.element('.' + FORM).append($scope.ManagedDataDefaults.Popup);
                $scope.ManagedDataDefaults.Init();
            },
            Init: function () {
                if ($scope.ManagedDataDefaults.CurrentItem.DefaultList) {
                    $scope.ManagedDataDefaults.DefaultList = $scope.ManagedDataDefaults.CurrentItem.DefaultList.slice(0);
                    $.each($scope.ManagedDataDefaults.DefaultList, function (i, d) {
                        if ($.inArray(d.Name, $scope.ManagedDataDefaults.SelectedList) >= 0)
                            d.selected = true;
                        else
                            d.selected = false;
                    });
                }
            },
            Check: function (d) {
                d.selected = !d.selected;
                if (d.selected)
                    $scope.ManagedDataDefaults.SelectedList.push(d.Name);
                else
                    $scope.ManagedDataDefaults.UnCheck(d);
            },
            UnCheck: function (d) {
                var index = $.inArray(d.Name, $scope.ManagedDataDefaults.SelectedList);
                d.selected = false;
                if (index >= 0) {
                    $scope.ManagedDataDefaults.SelectedList.splice(index, 1);
                }
            },
            Save: function () {
                $scope.ManagedDataDefaults.CurrentItem.Properties.Defaults = $scope.ManagedDataDefaults.SelectedList;
                $scope.ManagedDataDefaults.Close();
            },
            Close: function () {
                $scope.ManagedDataDefaults.Popup.remove();
            }
        };

        /*-----validation-----*/
        $scope._validations = VALIDATIONS;
        /*--------------------*/
        $scope.Validation = {
            Popup: null,
            SelectedList: [],
            Group: [],
            CurrentItem: null,
            SelectedItem: '',
            Edit: function (Item) {
                $scope.Validation.CurrentItem = Item;
                $scope.Validation.SelectedList = Item.Properties.Validator || [];
                $scope.Validation.Group = Item.ValidationGroups;

                var template = '<model-window content="Validations.html" title="Validations" width="700" height="400">' +
                                    ' <a class="ctrlBtn close-btn" ng-click="Validation.Save()"><i class="icon-remove"></i> Close</a> ' +
                                '</model-window>';
                $scope.Validation.Popup = $compile(template)($scope)[0];
                angular.element('.' + FORM).append($scope.Validation.Popup);
                $scope.Validation.Init();
            },
            Init: function () {

            },
            Add: function () {
                if ($scope.Validation.SelectedItem != -1) {
                    var sItem = {
                        RegEx: '',
                        Error: '',
                        Name: ''
                    };
                    if ($scope._validations[$scope.Validation.SelectedItem]) {
                        sItem.Name = $scope._validations[$scope.Validation.SelectedItem].Name;
                        sItem.RegEx = $scope._validations[$scope.Validation.SelectedItem].RegEx;
                        sItem.Error = $scope._validations[$scope.Validation.SelectedItem].Error;
                    }

                    $scope.Validation.SelectedList.push(sItem);
                }
            },
            AddGroup: function () {
                var group = window.prompt("Enter Group Name");
                if (group) {
                    if (!$scope.Form.ValidationGroups)
                        $scope.Form.ValidationGroups = [];

                    ($.inArray(group, $scope.Form.ValidationGroups) >= 0) ? $.notify('Validation group already exist', { type: 'error', position: 'bottom right' }) : $scope.Form.ValidationGroups.push(group);
                }
            },
            Delete: function (d) {
                var index = $.inArray(d, $scope.Validation.SelectedList);
                if (index >= 0) {
                    $scope.Validation.SelectedList.splice(index, 1);
                }
            },
            Save: function () {
                $scope.Validation.CurrentItem.Properties.Validator = $scope.Validation.SelectedList;
                $scope.Validation.CurrentItem.ValidationGroups = $scope.Validation.Group;
                $scope.Validation.Close();
            },
            Close: function () {
                $scope.Validation.Popup.remove();
            }
        };

    }]);

})(jQuery);