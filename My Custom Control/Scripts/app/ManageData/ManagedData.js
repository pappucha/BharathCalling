var ManagedData = angular.module('ManagedData', []);
MODULES.push('ManagedData');
ManagedData.service('ManagedDataService', ['$q', '$http',
function ($q, $http) {
    var ManagedDataService = {};
    var ServiceURL = {
        GetManagedDataTypes: 'api/Form/GetMasterList',
        GetManagedData: 'api/Workflow/GetManageDataByTypeName',
        GetManagedDataAttributes: 'api/ManageDataMapping/GetManageDataAttributes?GroupName=',
        AddOrUpdateManageData: 'api/Workflow/AddOrUpdateManageData',
        DeleteManagedData: 'api/Workflow/DeleteManageData?Id='
    };

    ManagedDataService.getManagedDataTypes = function () {
        var dobj = $q.defer();
        $http({
            url: ServiceURL.GetManagedDataTypes,
            method: 'GET',
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
        }).success(function (data) {
            dobj.resolve(data);
        });
        return dobj.promise;
    };

    ManagedDataService.GetManagedDataAttributes = function (groupName) {
        var dobj = $q.defer();
        $http({
            url: ServiceURL.GetManagedDataAttributes + groupName,
            method: 'GET',
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
        }).success(function (data) {
            dobj.resolve(data);
        });
        return dobj.promise;
    };

    ManagedDataService.getManagedData = function (type) {
        var dobj = $q.defer();
        $http({
            url: ServiceURL.GetManagedData,
            method: 'GET',
            params: { type: type },
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
        }).success(function (data) {
            dobj.resolve(data);
        });
        return dobj.promise;
    };

    ManagedDataService.addManagedData = function (data) {
        var dobj = $q.defer();
        $http({
            url: ServiceURL.AddOrUpdateManageData,
            method: 'POST',
            params: data,
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
        }).success(function (data) {
            dobj.resolve(data);
        });
        return dobj.promise;
    };

    ManagedDataService.updateManagedData = function (data) {
        var dobj = $q.defer();
        $http({
            url: ServiceURL.AddOrUpdateManageData,
            method: 'POST',
            params: data,
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
        }).success(function (data) {
            dobj.resolve(data);
        });
        return dobj.promise;
    };

    ManagedDataService.deleteManagedData = function () {
        var dobj = $q.defer();
        $http({
            url: ServiceURL.DeleteManagedData,
            method: 'GET',
            headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
        }).success(function (data) {
            dobj.resolve(data);
        });
        return dobj.promise;
    };

    return ManagedDataService;
}]);
ManagedData.controller('ManagedDataCntrl', ['$scope', '$http', '$compile', '$timeout', 'ManagedDataService',
function ($scope, $http, $compile, $timeout, ManagedDataService) {

    $scope.ManagedDataTypes = [];
    $scope.ManagedDataType = '';
    $scope.ManagedData = [];

    $scope.init = function () {
        $scope.getManagedDataType();
    };

    $scope.getManagedDataType = function () {
        ManagedDataService.getManagedDataTypes().then(function (data) {
            $scope.ManagedDataTypes = data;
            $scope.ManagedDataType = data[0].Name;
            $scope.getManagedData();
        });
    };

    $scope.getManagedData = function () {
        ManagedDataService.getManagedData($scope.ManagedDataType).then(function (data) {
            $scope.ManagedData = data;
            $scope.GridConfig.rows = $scope.ManagedData;
        });
    };

    $scope.Actions = {
        Edit: function (event, rowArr, gridScope) {
            var row = rowArr[0];
            console.log(row);
            $.prompt('Edit Managed Data', {
                inputs: [{
                    name: 'name',
                    'label': 'Name',
                    value: row.Name
                }, {
                    name: 'abbr',
                    'label': 'Abbrevation',
                    value: row.Abbreviation
                }, {
                    name: 'active',
                    label: 'Active',
                    type: 'checkboxGroup',
                    list: [{
                        label: '',
                        checked: row.Active
                    }]
                }],
                height: 210,
                title: 'Edit Managed Data',
                onComplete: function (res, value) {
                    if (res == 'Ok') {
                        if ($.trim(value) == '') {
                            return false;
                        } else {
                            ManagedDataService.addManagedData({
                                id: row.ID,
                                name: value[0].value,
                                abbr: value[1].value,
                                type: $scope.ManagedDataType,
                                active: value.length>2
                            }).then(function (data) {
                                $.notify('Managed data saved successfully', { position: 'top right', type: 'success' });
                                row.Name = value[0].value;
                                row.Abbreviation = value[1].value;
                                row.Active = value.length > 2;
                            });
                        }
                    }
                }
            });
        },
        EditAttributes: function (event, rowArr) {
            var row = rowArr[0];
            //console.log(row.Name);
            ManagedDataService.GetManagedDataAttributes(row.Name).then(function (taskName) {
                var tName = taskName.replace(/['"]+/g, '');
                if (tName) {
                    var url = path + 'Request?Type=ItemAttributes&taskName=' + tName + '&GroupName=' + row.Name + '&Frame=true';
                    $.modal('Edit Attributes', url, { type: 'iframe' });
                } else {
                    $.notify("The selected group has no attributes", { type: "error" });
                }
            });
        },
        Add: function () {
            $.prompt('Name', {
                height: 170,
                title: 'Add Managed Data',
                inputs: [{
                    name: 'name',
                    'label': 'Name',
                    value: ""
                }, {
                    name: 'abbr',
                    'label': 'Abbreviation',
                    value: ""
                }],
                onComplete: function (res, value) {
                    if (res == 'Ok') {
                        if ($.trim(value[0].value) == '') {
                            return false;
                        } else {
                            ManagedDataService.addManagedData({
                                id: 0,
                                name: value[0].value,
                                abbr: value[1].value,
                                type: $scope.ManagedDataType,
                                active: true
                            }).then(function (data) {
                                $.notify('Managed data added successfully', { position: 'top right', type: 'success' });
                                $scope.getManagedData();
                            });
                        }
                    }
                }
            });
        }
    };

    $scope.GridConfig = {
        rows: $scope.ManagedData,
        actions: [{
            name: 'Edit',
            displayType: 'button',
            iconClass: 'fa fa-edit',
            //textTemplate: '<i class="fa fa-edit"></i>',
            isGeneralAction: false,
            actionType: 'function',
            action: "Edit"
        }, {
            name: 'Edit Attributes',
            displayType: 'button',
            iconClass: 'fa fa-info',
            //textTemplate: '<i class="fa fa-edit"></i>',
            isGeneralAction: false,
            actionType: 'function',
            action: "EditAttributes"
        }],
        pageSize: 20,
        columns: [{
            name: 'Name',
            value: 'Name'
        },
        {
            name: 'Abbreviation',
            value: 'Abbreviation'
        },
        {
            name: 'UpdatedBy',
            value: 'UpdatedBy'
        },
        {
            name: 'UpdatedOn',
            value: 'UpdatedOn'
        },
        {
            name: 'Active',
            value: 'Active'
        }
        ],
        actionReference: $scope.Actions
    };

}]);