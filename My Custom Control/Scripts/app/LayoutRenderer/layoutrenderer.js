(function ($, window, document, undefined) {
    var ELEM_TYPE = {
        ROW: 'Row',
        COLUMN: 'Column',
        TABS: 'Tabs',
        TAB: 'Tab',
        SECTION: 'Section',
        FORM: 'Form',
        LINEBREAK: 'LineBreak',
        PARAGRAPH: 'Paragraph',
        GROUPPANEL: 'GroupPanel'
    };

    MODULES.push('LayoutRenderer');
    angular.module('LayoutRenderer', [], function ($rootScopeProvider) {
        $rootScopeProvider.digestTtl(50);
    })
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    }])

    .factory('LayoutRendererService', ['$q', '$http', function ($q, $http) {
        var LayoutRendererService = {};
        LayoutRendererService.serviceURL = {
            getLayout: path + 'api/Service/GetLayout',
            getInjectTaskTemplate: path + 'api/Service/InjectTaskTemplate',
            getLayoutByTaskID: path + 'api/Service/GetLayoutByTaskID',
            getLayoutByJobID: path + 'api/Service/GetLayoutByJobID',
            getPostData: path + 'api/Service/PostData',
            getGridData: path + 'api/Grid/GetGridConfig',
            getItemAttributes: path + 'api/Service/GetItemAttributes',
            getItemInfo: path + 'api/Routing/GetItemInfo',
            submitLayout: ''
        };
        LayoutRendererService.serviceType = {
            ADDJOB: "AddJob",
            INJECTTASK: "InjectTask",
            JOB: "Job",
            TASK: "Task",
            ItemAttributes: 'ItemAttributes'
        };
        LayoutRendererService.getLayout = function () {
            var dobj = $q.defer(),
                serviceURL = "",
                data = {};
            switch ($.QueryString.Type) {
                case LayoutRendererService.serviceType.INJECTTASK:
                    serviceURL = LayoutRendererService.serviceURL.getInjectTaskTemplate;
                    var tempJobID = LayoutRendererService.getToken();
                    
                    if (window != window.parent) 
                        tempJobID = window.parent.$('[name="__RequestVerificationToken"]').val();
                    
                    tempJobID = ($.QueryString.jobID && $.QueryString.jobID != "undefined") ? $.QueryString.jobID : tempJobID;
                    
                    data = { taskName: $.QueryString.taskName, jobID: tempJobID };
                    break;
                case LayoutRendererService.serviceType.JOB:
                    serviceURL = LayoutRendererService.serviceURL.getLayoutByJobID;
                    data = { jobID: $.QueryString.jobID, taskName: $.QueryString.taskName };
                    break;
                case LayoutRendererService.serviceType.TASK:
                    serviceURL = LayoutRendererService.serviceURL.getLayoutByTaskID;
                    data = { taskID: $.QueryString.taskID };
                    break;
                case LayoutRendererService.serviceType.ItemAttributes:
                    serviceURL = LayoutRendererService.serviceURL.getItemAttributes;
                    data = { taskName: $.QueryString.taskName, GroupName: $.QueryString.GroupName };
                    break;
                default:
                    serviceURL = LayoutRendererService.serviceURL.getLayout;
                    data = { taskName: $.QueryString.taskName, jobID: ($.QueryString.jobID && $.QueryString.jobID != "undefined") ? $.QueryString.jobID : 0 };
                    break;
            }

            $http({
                headers: { 'RequestVerificationToken': LayoutRendererService.getToken() },
                url: serviceURL,
                method: 'GET',
                params: data
            }).success(function (data) {
                dobj.resolve(data);
            }).error(function (data, status) {
                dobj.reject(data, status);
            });
            return dobj.promise;
        }
        LayoutRendererService.PostData = function (postData) {
            var dobj = $q.defer();
            $http.post(
                LayoutRendererService.serviceURL.getPostData,
                postData,
                { 'headers': { 'RequestVerificationToken': LayoutRendererService.getToken() } }
            ).success(function (data) {
                dobj.resolve(data);
            }).error(function (data, status) {
                dobj.reject(data, status);
            });
            return dobj.promise;
        }
        LayoutRendererService.getToken = function () {
            return $('[name="__RequestVerificationToken"]').val() || "";
        }
        LayoutRendererService.getGridData = function (gridID) {
            var dobj = $q.defer();
            $http({
                headers: { 'RequestVerificationToken': LayoutRendererService.getToken() },
                url: LayoutRendererService.serviceURL.getGridData,
                method: 'GET',
                params: { pageID: gridID, ItemType: '' }
            }).success(function (data) {
                dobj.resolve(data);
            }).error(function (data, status) {
                dobj.reject(data, status);
            });
            return dobj.promise;
        }
        LayoutRendererService.getCustomGridData = function (pageUrl) {
            var dobj = $q.defer();
            $http({
                headers: { 'RequestVerificationToken': LayoutRendererService.getToken() },
                url: pageUrl,
                method: 'GET'
            }).success(function (data) {
                dobj.resolve(data);
            }).error(function (data, status) {
                dobj.reject(data, status);
            });
            return dobj.promise;
        }
        LayoutRendererService.getGroupByType = function (groupType) {
            var dobj = $q.defer();
            $http({
                url: path + 'api/Service/GetGroupsByType?type=' + groupType,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() },
            }).success(function (data) {
                dobj.resolve(data);
            });
            return dobj.promise;
        }
        LayoutRendererService.getUsersGroups = function (groups) {
            var dobj = $q.defer();
            $http({
                url: path + 'api/Service/GetUsersGroups?groups=' + groups,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() },
            }).success(function (data) {
                dobj.resolve(data);
            });
            return dobj.promise;
        }
        LayoutRendererService.getItemInfo = function () {
            var dobj = $q.defer();
            $http({
                url: LayoutRendererService.serviceURL.getItemInfo,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() },
            }).success(function (data) {
                dobj.resolve(data);
            });
            return dobj.promise;
        };
        return LayoutRendererService;
    }])
    .directive("include", function ($http, $templateCache, $compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                var templateUrl = scope.$eval(attributes.include);

                $http.get(templateUrl, { cache: $templateCache }).success(
                    function (tplContent) {
                        element.replaceWith($compile(tplContent)(scope));

                        if (scope.item.Properties) {
                            if (scope.item.Type == 'ManagedData' || scope.item.Type == 'Select' || scope.item.Type == 'ManagedDataGroup')
                                scope.item.Properties.Value = scope.item.Properties.Value?scope.item.Properties.Value.split(','):[];
                        }
                    }
                );
            }
        };
    })
    .directive('layout', function () {
        var layoutTemplate = ['<div ng-init="init()">',
                                    '<div ng-repeat="item in layout.Items">',
                                        '<div include="item.Type">',
                                        '</div>',
                                    '</div>',
                              '</div>'].join('');
        return {
            replace: true,
            restrict: 'E',
            require: 'ngModel',
            controller: function ($scope) {
                $scope.Handlers = $scope.$parent.Handlers;
                $scope.getColumnWidth = function (styleObj) {
                    var width = parseFloat(styleObj.width) || 100;
                    return Math.round(width * 0.12);
                };
            },
            scope: {
                layout: '=ngModel'
            },
            template: layoutTemplate,
            link: function (scope, elememt, attrs) {
                scope.Renderer = scope.$parent;
            }
        }
    })
    .directive('gridRenderer', ['$compile', 'LayoutRendererService', function ($compile, LayoutRendererService) {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                model: '=?ngModel',
                gridObj: '=config'
            },
            controller: function ($scope, $element, $attrs) {
                $scope.gridConfig = {};
                $scope.selectedItems = [];
                $scope.init = function () {
                    if ($scope.gridObj.Properties.GridSettings.IsCustomGrid) {
                        LayoutRendererService.getCustomGridData($scope.gridObj.Properties.GridSettings.dataUrl).then(function (data) {
                            $scope.gridObj.Properties.GridSettings.rows = data;
                            $scope.gridConfig = $scope.gridObj.Properties.GridSettings;
                            $scope.gridConfig.actionReference = window.glams.GridActions;
                            var grid = $compile('<grid config="gridConfig" ng-model="model"></grid>')($scope)[0];
                            $element.append(grid);
                        });
                    }
                    else {
                        LayoutRendererService.getGridData($scope.gridObj.Id).then(function (data) {
                            $scope.gridConfig = data;
                            $scope.gridConfig.actionReference = window.glams.GridActions;
                            $scope.gridConfig.serverPaging = data.pagingEnabled;
                            $scope.gridConfig.showFilterExpression = true;
                            $scope.gridConfig.headers = { 'RequestVerificationToken': LayoutRendererService.getToken() };

                            $scope.reloadGrid = function () {
                                if (typeof $scope.gridConfig.extendedObject.SelectedGroup == 'string')
                                    $scope.gridConfig.extendedObject.SelectedGroup = [$scope.gridConfig.extendedObject.SelectedGroup];

                                $scope.$$childTail.CurrentGrid.reload();
                            };

                            var template = ['<div>',
                                                '<div class="text-right">',
                                                    '<span><i class="fa fa-list-ul"></i> Groups </span>',
                                                    '<select ng-if="gridConfig.extendedObject.Groups" custom-select class="no-fluid" multiple="true" ng-model="gridConfig.extendedObject.SelectedGroup" ng-change="reloadGrid()">' +
                                                        '<option ng-repeat="grp in gridConfig.extendedObject.Groups" value="{{grp.ID}}">{{grp.Name}}</option>' +
                                                    '</select>' +
                                                    '<a ng-if="gridConfig.IsAdmin" href="' + path + 'Grid/Settings?pageID=' + $scope.gridObj.Id + '&Frame=true" modal-popup="{fullscreen:true}" modal-popup-title="Grid Settings" class="btn">',
                                                        '<i class="fa fa-wrench"></i> Settings',
                                                    '</a>',
                                                '</div>',
                                                '<div ng-if="gridConfig"><grid config="gridConfig" object="CurrentGrid" ng-model="model"></grid></div>',
                                            '</div>'].join('');
                            var grid = $compile(template)($scope)[0];
                            $element.append(grid);
                        });
                    }
                };
            },
            template: '<div class="grid-renderer" ng-init="init()"></div>'
        };
    }])
    .controller('LayoutRendererCntrl', ['$scope', 'LayoutRendererService', function ($scope, LayoutRendererService) {
        $scope.taskName = $.QueryString.taskName;
        $scope.Header = $('[name="__RequestVerificationToken"]').val();
        $scope.Layout = [];
        $scope.ItemInfoCollections = [];
        $scope.isRequestInProgress = false;
        $scope.init = function () {
            $scope.isRequestInProgress = true;
            LayoutRendererService.getLayout().then(function (data) {
                $scope.Layout = data;
                $scope.Utils.prepareLayout();

                if (data.Error) {
                    $scope.isRequestInProgress = false;
                    $.alert(data.Error, {
                        onComplete: function (res) {
                            window.parent.location.href = path + homeUrl;
                        }
                    });
                }
                else {
                    $scope.isRequestInProgress = false;
                }

                LayoutRendererService.getItemInfo().then(function (data) {
                    $scope.ItemInfoCollections = data;
                });
            });

        };
        $scope.UsersGroups = [];

        $scope.Utils = {
            getJson: function (attributes) {
                return JSON.parse(attributes);
            },
            prepareLayout: function () {
                (function iterate(item) {
                    if (item.Properties) {
                        item.Properties.Error = null;
                        switch (item.Type) {
                            case 'FileUpload':
                                item.Properties.Value && (item.Properties.Value = $.parseJSON(item.Properties.Value));
                                break;
                            case 'Date':
                                (item.Properties.Value) && (item.Properties.Value = moment(item.Properties.Value, 'DD-MMM-YYYY').toDate());
                                break;
                            case 'BarCode':
                                if (item.Properties.Value) {
                                    var list = item.Properties.Value.split(',');
                                    item.Properties.Value = list[0] || '';
                                    $.each(item.Properties.Options, function (i, it) {
                                        if (list[1] && it.Value == list[1]) {
                                            it.Selected = true;
                                        }
                                    });
                                }
                                break;
                        }
                    }
                    $.each(item.Items, function (index, c) {
                        iterate(c);
                    });
                })($scope.Layout);
            },
            getItems: function (item) {
                if (item.Properties) {
                    switch (item.Type) {
                        case 'FileUpload':
                            item.Properties.Value && (item.Properties.Value = JSON.stringify(item.Properties.Value));
                            break;
                        case 'Date':
                            item.Properties.Value && (item.Properties.Value = moment(item.Properties.Value).format('DD-MMM-YYYY'));
                            break;
                        case 'BarCode':
                            (item.Properties.BarcodeType) && (item.Properties.Value = [item.Properties.Value, item.Properties.BarcodeType.Value].toString());
                            break;
                        default:
                            item.Properties.Value = item.Properties.Value ? item.Properties.Value.toString() : '';
                            break;
                    }
                    item.Properties.Roles = item.Properties.Roles || [];
                }
                $.each(item.Items, function (index, c) {
                    $scope.Utils.getItems(c);
                });
            },
            toggleTabHandler: function (item, items) {
                $.each(items, function (i, it) {
                    it.Properties.Active = false;
                });
                item.Properties.Active = true;
            },
            getGrousByTypeName: function (groupType) {
                return LayoutRendererService.getGroupByType(groupType);
            },
            getUsersGroups: function (groups) {
                return LayoutRendererService.getUsersGroups(groups);
            },
            getBarcodeType: function (itemObj) {
                var barcodeType = {};
                $.each(itemObj.Properties.Options, function (i, c) {
                    if (c.Selected)
                        barcodeType = c;
                });
                return barcodeType;
            },
            getBarcodeImageUrl: function (itemObj) {
                var barcodeType = $scope.Utils.getBarcodeType(itemObj);
                return 'Request/GetBarCode?label=' + itemObj.Properties.Name + '&barcodeType=' + barcodeType.Text + '&barcodeValue=' + itemObj.Properties.Value;
            },
            getItemInfo: function (key) {
                var r = _.filter($scope.ItemInfoCollections, function (rinfo) {
                    return key == rinfo.Name;
                });
                return (r.length) ? r[0].ValueString : undefined;
            },
            validate: function (ActionItem) {
                var isValid = true;
                (function iterate(item) {

                    (item.Properties && item.Properties.Validator && item.Properties.Validator.length && item.Properties.Visible) && (item.Properties.Error = null);
                    if ((ActionItem.ValidationGroups.length && $.inArray(ActionItem.ValidationGroups.toString(), item.ValidationGroups) >= 0) && !$scope.Utils.validateHandler(item))
                        isValid = false;
                    if (item.Items.length)
                        $.each(item.Items, function (i, _item) {
                            iterate(_item);
                        });
                })($scope.Layout);

                return isValid;
            },
            validateHandler: function (item) {
                var isValid = true;
                if (item.Properties && item.Properties.Validator && item.Properties.Validator.length && item.Properties.Visible) {
                    item.Properties.Error = null;
                    $.each(item.Properties.Validator, function (i, vObj) {
                        if (item.Properties.Error)
                            return;
                        var exp = new RegExp(vObj.RegEx);
                        var type = item.Type;
                        var value = item.Properties.Value;
                        var validation = false;
                        switch (type) {
                            case 'Select':
                            case 'ManagedData':
                                console.log(value);
                                if (typeof value == 'string') {
                                    $.each(item.Properties.Options, function (i, opt) {
                                        if (opt.Value == value)
                                            validation = true;
                                    });
                                }
                                else {
                                    $.each(item.Properties.Options, function (i, opt) {
                                        if ($.inArray(opt.Value, value) >= 0)
                                            validation = true;
                                    });
                                }
                                break;
                            case 'Date':
                                if (exp.test(value)) {
                                    var date = moment(value).format("DD-MMM-YYYY");
                                    validation = moment(date).isValid();
                                }
                                break;
                                /*case 'SingleCheckBox':

                                    break;
                                case 'CheckboxGroup':

                                    break;*/
                            case 'BarCode':
                                if (!item.Properties.BarcodeType)
                                    validation = false;
                                else {
                                    var barcodeType = item.Properties.BarcodeType.Value;
                                    if (barcodeType && value)
                                        validation = true;
                                }
                                break;
                            case 'FileUpload':
                                if (value.length > 0 && $.inArray(undefined, value) < 0)
                                    validation = true;
                                break;
                            default:
                                validation = exp.test(value);
                                break;
                        }
                        if (!validation) {
                            isValid = false;
                            item.Properties.Error = vObj.Error;
                        }
                    });
                }
                return isValid;
            },
            getCurrentDate: function () {
                return moment().format('DD-MMM-YYYY');
            },
            getPreview: function () {
                return path + '/Download/GetPreview?token=' + $('[name="__RequestVerificationToken"]').val()
            }
        };

        $scope.Handlers = {
            post: function (Item) {
                if ($scope.isRequestInProgress)
                    return false;

                if (Item.Type == 'Button' && !$scope.Utils.validate(Item))
                    return false;

                if (Item.Properties.IsPostBack) {
                    if (Item.Properties.Alert) {
                        $.confirm(Item.Properties.Alert, {
                            onComplete: function (result) {
                                switch (result) {
                                    case 'Yes':
                                        $scope.Handlers.postHandler(Item);
                                        break;
                                }
                            }
                        });
                    }
                    else {
                        $scope.Handlers.postHandler(Item);
                    }
                }
                else if (Item.Properties.TaskTemplate) {                    
                    var temppath = path + "Request?Type=InjectTask&taskName=" + Item.Properties.TaskTemplate + "&jobID=" + $.QueryString.jobID + "&Frame=1";

                    if (Item.Properties.ModalPosition == 'center')
                        $.modal(Item.Properties.TaskTemplate, temppath, { type: 'iframe' });
                    else
                        $.aside(Item.Properties.TaskTemplate, temppath, { type: 'iframe', position: Item.Properties.ModalPosition });
                }
            },
            postHandler: function (item) {
                $scope.Utils.getItems($scope.Layout);
                var uiObj = new Object();
                uiObj.Id = $scope.Layout.Id;
                uiObj.Name = $scope.Layout.Name;
                uiObj.UserId = $scope.Layout.Name;
                uiObj.Handler = item.Properties.Name;
                uiObj.Form = item.Properties.Form;
                uiObj.TaskName = $scope.Layout.TaskName;
                uiObj.IsTask = $scope.Layout.IsTask;
                uiObj.Items = $scope.Layout.Items;
                $scope.isRequestInProgress = true;

                LayoutRendererService.PostData(uiObj).then(function (data) {
                    $scope.Layout = data;
                    $scope.Utils.prepareLayout();
                    if (data.Message) {
                        $scope.isRequestInProgress = false;
                        $.alert(data.Message, {
                            onComplete: function (res) {
                                $scope.Handlers.redirectHandler(data);
                            }
                        });
                    }

                    if (data.Error) {
                        $scope.isRequestInProgress = false;
                        $.alert(data.Error, {
                            onComplete: function (res) {
                                $scope.Handlers.redirectHandler(data);
                            }
                        });
                    }

                    if (!data.Message && !data.Error) {
                        $scope.Handlers.redirectHandler(data);
                    }
                }, function (err) {
                    $scope.isRequestInProgress = false;
                    $.alert('Internal Server Error. Please try again later', {
                        icon: 'error',
                        onComplete: function () {
                            window.parent.location.href = path + homeUrl;
                        }
                    });
                });
            },
            redirectHandler: function (data) {
                if (window == window.parent && data.RedirectToGrid && data.Error.length == 0) {
                    window.parent.location.href = path + homeUrl;
                }
                else if (window.parent.location.href.indexOf("Type=AddJob") >= 0 && window.location.href.indexOf("Type=InjectTask") == -1 && (data.Error && data.Error.length == 0)) {
                    var href = window.location.href;
                    window.parent.location.href = href.substring(0, href.lastIndexOf('=') + 1) + data.JobID;
                }
                else if (window.parent.location.href.indexOf("Type=AddJob") >= 0 && window.location.href.indexOf("Type=InjectTask") >= 0 && data.RedirectToGrid && data.Error.length == 0) {
                    window.parent.location.href = window.parent.location.href;
                }
                else if ((window.location.href.indexOf("Type=InjectTask") >= 0 || window.location.href.indexOf("Type=ItemAttributes") >= 0) && data.RedirectToGrid && data.Error.length == 0) {
                    window.parent.location.href = window.parent.location.href;
                }
                else if ((window.location.href.indexOf("Type=Task") >= 0 || window.location.href.indexOf("Type=Job") >= 0) && data.RedirectToGrid && data.Error.length == 0) {
                    window.parent.location.href = window.parent.location.href;
                }
                else {
                    $scope.isRequestInProgress = false;
                }
            }
        };
    }]);
})(jQuery, window, document);