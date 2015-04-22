var APP = angular.module('GridSettings', ['glams.audit']);;
(function ($) {
    MODULES.push('GridSettings');
    APP.factory('GridSettingsService', ['$q', '$http', function ($q, $http) {
        var GridSettingsService = {};

        var SERVICE = {
            DefaultModel: path + 'api/Grid/GetGridDefaultModel',
            Stages: path + 'api/Grid/GetStages',
            Columns: path + 'api/Grid/GetColumns',
            ItemTypes: path + 'api/Grid/GetItemTypes',
            GridSettings: path + 'api/Grid/GetGridSettings',
            Save: path + 'api/Grid/CreateOrUpdate',
            TaskTemplates: path + 'api/Grid/GetTaskTemplates',
            Roles: path + 'api/Grid/GetRoles'
        }

        GridSettingsService.GetDefaultModel = function () {
            return $http({
                url: SERVICE.DefaultModel,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            });
        };

        GridSettingsService.GetStages = function () {
            return $http({
                url: SERVICE.Stages,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            });
        };

        GridSettingsService.GetColumns = function () {
            return $http({
                url: SERVICE.Columns,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            });
        };

        GridSettingsService.GetItemTypes = function () {
            return $http({
                url: SERVICE.ItemTypes,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            });
        };

        GridSettingsService.GetTaskTemplates = function () {
            return $http({
                url: SERVICE.TaskTemplates,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            });
        };

        GridSettingsService.GetRoles = function () {
            return $http({
                url: SERVICE.Roles,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            });
        };

        GridSettingsService.GetGridSettings = function (pageId) {
            return $http({
                url: SERVICE.GridSettings,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
                params: { pageID: pageId }
            });
        };


        GridSettingsService.Save = function (gridObj) {
            return $http({
                url: SERVICE.Save,
                method: 'POST',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
                data: gridObj
            });
        };

        GridSettingsService.init = function () {
            return $q.all([
                GridSettingsService.GetColumns(),
                GridSettingsService.GetStages(),
                GridSettingsService.GetItemTypes(),
                GridSettingsService.GetRoles(),
                GridSettingsService.GetDefaultModel(),
                GridSettingsService.GetTaskTemplates()
            ]);
        };

        return GridSettingsService;
    }]);

    APP.controller('GridSettingsController', ['$scope', '$http', '$timeout', 'GridSettingsService', 'Audit', function ($scope, $http, $timeout, GridSettingsService, Audit) {
        $scope.isLoading = true;

        $scope.Audit = {};

        $scope.SortHandler = {
            Column: function (event, ui) {
                var start = ui.item.data('start'),
                    end = ui.item.index();
                $scope.GridSettings.Data.CurrentGrid.ColumnSet.splice(end, 0, $scope.GridSettings.Data.CurrentGrid.ColumnSet.splice(start, 1)[0]);
            },
            Stage: function (event, ui) {
                var start = ui.item.data('start'),
                    end = ui.item.index();
                $scope.GridSettings.Data.CurrentGrid.StageSet.splice(end, 0, $scope.GridSettings.Data.CurrentGrid.StageSet.splice(start, 1)[0]);
            },
            Action: function (event, ui) {
                var start = ui.item.data('start'),
                    end = ui.item.index();
                $scope.GridSettings.Data.CurrentGrid.ActionSet.splice(end, 0, $scope.GridSettings.Data.CurrentGrid.ActionSet.splice(start, 1)[0]);
            }
        }

        $scope.GridSettings = {
            Data: {
                DefaultModel: {},
                Columns: [],
                Column: '',
                ItemTypes: [],
                Stages: [],
                TaskTemplates: [],
                Roles: [],
                CurrentGrid: {},
                Grids: [],
                ItemType: '',
                GridType: 1
            },
            Init: function () {
                GridSettingsService.init().then(function (result) {
                    $scope.GridSettings.Data.Columns = result[0].data;
                    $scope.GridSettings.Data.Stages = result[1].data;
                    $scope.GridSettings.Data.ItemTypes = result[2].data;
                    $scope.GridSettings.Data.Roles = result[3].data;
                    $scope.GridSettings.Data.DefaultModel = result[4].data;
                    $scope.GridSettings.Data.TaskTemplates = result[5].data;

                    $scope.GridSettings.LoadGridSettings();

                    $scope.$watch('GridSettings.Data.GridType', function (v) {
                        $.each($scope.GridSettings.Data.Grids, function (i, grid) {
                            grid.GridType = $scope.GridSettings.Data.GridType;
                        });
                    });
                });
            },
            LoadGridSettings: function () {
                var pageId = $.QueryString.pageID;
                $scope.isLoading = true;
                GridSettingsService.GetGridSettings(pageId).then(function (result) {
                    $scope.isLoading = false;
                    var data = result.data;
                    $scope.GridSettings.Data.Grids = data;
                    if (data.length) {
                        $scope.GridSettings.Data.CurrentGrid = data[0];
                        $scope.GridSettings.Data.GridType = data[0].GridType || 1;
                    }

                    $scope.Audit = $.extend(true, {}, $scope.GridSettings.Data);
                });
            },
            Save: function () {

                var newAudit = $.extend(true, {}, $scope.GridSettings.Data);

                function GetGridType(r) {
                    switch (r.GridType) {
                        case 1:
                            return "MyTask";
                        case 2:
                            return "GroupTask";
                        case 3:
                            return "Tracker";
                        case 4:
                            return "Repository";
                    }
                };

                function GetItemType(r) {
                    for (var i = 0; i < $scope.GridSettings.Data.ItemTypes.length; i++) {
                        var itemType = $scope.GridSettings.Data.ItemTypes[i];
                        if (itemType && itemType.ID == r.ItemType)
                            return itemType.Name;
                    }
                };

                function actionSet(oArray, actionType, r) {
                    for (var i = 0; i < oArray.length; i++) {
                        var column = oArray[i];
                        column['$$hashKey'] && (delete column['$$hashKey']);
                        column.AuditName = r.AuditName + " -> " + actionType + "(" + column.name + ")";
                    }

                    return oArray;
                }

                function codeSet(oArray, actionType, r) {
                    for (var i = 0; i < oArray.length; i++) {
                        var column = oArray[i];
                        column['$$hashKey'] && (delete column['$$hashKey']);
                        column.AuditName = r.AuditName + " -> " + actionType + "(" + column.Name + ")";
                    }
                    return oArray;
                }

                function auditDataHelper(grids) {
                    for (var g = 0; g < grids.length; g++) {

                        var r = grids[g];

                        r.AuditName = "GridType(" + GetGridType(r) + ") -> ItemType(" + GetItemType(r) + ")";

                        actionSet(r.ColumnSet, 'Column', r);
                        actionSet(r.ActionSet, 'Action', r);
                        codeSet(r.ColorCodeSet, 'Colour Code', r);
                        codeSet(r.StageSet, 'Stage', r);

                        delete r['$$hashKey'];
                    }

                    return grids;
                };

                GridSettingsService.Save($scope.GridSettings.Data.Grids).then(function (data) {
                    Audit.log(Audit.Type.WORKFLOW, $scope.Audit.Grids, newAudit.Grids, auditDataHelper).then(function () {
                        $scope.Audit = newAudit;
                        window.parent.location.reload();
                    });
                });
            },
            Close: function () {
                window.parent.glams.modal.getAll()[0].close();
            },
            Utility: {
                GetItemType: function (itemTypeId) {
                    var ItemType = {};
                    $.each($scope.GridSettings.Data.ItemTypes, function (i, it) {
                        if (it.ID == itemTypeId)
                            ItemType = it;
                    });
                    return ItemType;
                },
                GetItemName: function (itemTypeId) {
                    var itemType = $scope.GridSettings.Utility.GetItemType(itemTypeId);
                    return itemType.Name || '';
                },
                GetDefaultModel: function () {
                    return $.extend(true, {}, $scope.GridSettings.Data.DefaultModel);
                },
                isDuplicate: function (itemTypeId) {
                    var isDuplicate = false;
                    $.each($scope.GridSettings.Data.Grids, function (i, grid) {
                        if (grid.ItemType == itemTypeId)
                            isDuplicate = true;
                    });
                    return isDuplicate;
                },
                AddHierarchy: function () {
                    if ($scope.GridSettings.Data.ItemType && !$scope.GridSettings.Utility.isDuplicate($scope.GridSettings.Data.ItemType)) {
                        var grid = $scope.GridSettings.Utility.GetDefaultModel();
                        $scope.GridSettings.Data.Grids.push(grid);
                        grid.PageID = $.QueryString.pageID;
                        grid.ItemType = $scope.GridSettings.Data.ItemType;
                        grid.GridType = $scope.GridSettings.Data.GridType;
                        $scope.GridSettings.Data.CurrentGrid = grid;
                    }
                },
                DeleteHierarchy: function (grid) {
                    if ($scope.GridSettings.Data.Grids.length > 1) {
                        var index = $.inArray(grid, $scope.GridSettings.Data.Grids);
                        if (index >= 0) {
                            $scope.GridSettings.Data.Grids.splice(index, 1);
                            if ($scope.GridSettings.Data.CurrentGrid == grid) {
                                $scope.GridSettings.Data.CurrentGrid = $scope.GridSettings.Data.Grids[0];
                            }
                        }
                    }
                },
                AddColumn: function () {
                    if ($scope.GridSettings.Data.Column) {
                        var column = $.extend(true, {}, $scope.GridSettings.Data.DefaultModel.ColumnSet[0]);
                        column.name = $scope.GridSettings.Data.Column;
                        column.value = $scope.GridSettings.Data.Column;
                        $scope.GridSettings.Data.CurrentGrid.ColumnSet.push(column);
                    }
                },
                DeleteColumn: function (col) {
                    var index = $.inArray(col, $scope.GridSettings.Data.CurrentGrid.ColumnSet);
                    if (index >= 0)
                        $scope.GridSettings.Data.CurrentGrid.ColumnSet.splice(index, 1);
                }
            }
        }
    }]);
})(jQuery);