var EmailTemplate = angular.module('EmailTemplate', []);
MODULES.push('EmailTemplate');
EmailTemplate.service('EmailTemplateService', ['$q', '$http',
function ($q, $http) {
    var EmailTemplateService = {};
    var ServiceURL = {
        GetEmailTemplates: 'api/EmailNotificationTemplates/GetEmailNotificationTemplates',
        GetEmailTemplate: 'api/EmailNotificationTemplates/GetEmailNotificationTemplate',
        UpdateEmailTemplateName: 'api/EmailNotificationTemplates/UpdateEmailNotificationTemplate',
        DeleteEmailTemplate: 'api/EmailNotificationTemplates/DeleteEmailNotificationTemplate',
        GetItemInfo: 'api/form/GetAttributeDefs'
    };

    var Request = function (url, data, method) {
        var dobj = $q.defer();

        if (method == 'POST') {
            $http({
                url: url,
                data: data || null,
                method: method,
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data) {
                dobj.resolve(data);
            });
        } else {
            $http({
                url: url,
                params: data || null,
                method: 'GET',
                headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" }
            }).success(function (data) {
                dobj.resolve(data);
            });
        }


        return dobj.promise;
    }

    EmailTemplateService.getEmailTemplates = function () {
        return Request(ServiceURL.GetEmailTemplates);
    };

    EmailTemplateService.getEmailTemplate = function (id) {
        return Request(ServiceURL.GetEmailTemplate, { id: id });
    };

    EmailTemplateService.update = function (TemplateObj) {
        return Request(ServiceURL.UpdateEmailTemplateName, TemplateObj, 'POST');
    };

    EmailTemplateService.deleteEmailTemplate = function (id) {
        return Request(ServiceURL.DeleteEmailTemplate, { id: id });
    };

    EmailTemplateService.getItemInfo = function () {
        return Request(ServiceURL.GetItemInfo);
    };

    return EmailTemplateService;
}]);
EmailTemplate.controller('EmailTemplateCntrl', ['$scope', '$http', '$compile', '$timeout', 'EmailTemplateService',
function ($scope, $http, $compile, $timeout, EmailTemplateService) {

    $scope.EmailTemplates = [];
    $scope.ItemInfo = [];

    $scope.init = function () {
        $scope.getEmailTemplates();
        EmailTemplateService.getItemInfo().then(function (data) {
            $scope.ItemInfo = window.glams.ItemInfo = data;
        });
    };

    CKEDITOR.plugins.addExternal('ItemInfo', path + 'Scripts/lib/ckeditor/ItemInfo/', 'plugin.js');

    $scope.editorConfig = {
        resize_enabled: false,
        toolbar: 'Full',
        extraPlugins: 'ItemInfo',
        filebrowserBrowseUrl: path + 'EmailNotificationTemplates/BrowseFiles?frame=0',
        filebrowserUploadUrl: path + 'api/EmailNotificationTemplates/Upload'
    }

    $scope.getEmailTemplates = function () {
        EmailTemplateService.getEmailTemplates().then(function (data) {
            $scope.EmailTemplates = data;
            $scope.GridConfig.rows = $scope.EmailTemplates;
        });
    };

    $scope.Actions = {
        Popup: null,
        New: function () {
            $scope.EditTemplate = {
                Content: "",
                EmailNotificationTemplate: {
                    ID: 0,
                    IsDefunct: false,
                    Name: "",
                    Subject: "",
                    UpdatedBy: '00000000-0000-0000-0000-000000000000',
                    UpdatedOn: moment().format('DD-MMM-YYYY')
                },
                EmailTemplateID: 0,
                ID: 0,
                UpdatedBy: '00000000-0000-0000-0000-000000000000',
                UpdatedOn: moment().format('DD-MMM-YYYY')
            };
            var elm = $compile('<div ng-include="\'EditTemplate.html\'"></div>')($scope);
            $scope.Actions.Popup = $.modal('Edit Email Template', elm[0], { fullscreen: true });
        },
        Edit: function (event, rowArr, gridScope) {
            var templateObj = rowArr[0];
            EmailTemplateService.getEmailTemplate(templateObj.ID).then(function (data) {
                $scope.EditTemplate = data;
                var elm = $compile('<div ng-include="\'EditTemplate.html\'"></div>')($scope);
                $scope.Actions.Popup = $.modal('Edit Email Template', elm[0], { fullscreen: true });
            });
        },
        Delete: function (event, rowArr, gridScope) {
            var templateObj = rowArr[0];
            $.confirm('Are you sure want to delete?', {
                onComplete: function (res) {
                    if (res == 'Yes')
                        EmailTemplateService.deleteEmailTemplate(templateObj.ID).then(function (data) {
                            $.notify('Deleted successfully', { type: 'success' });
                            $scope.getEmailTemplates();
                        });
                }
            });
        },
        Close: function () {
            ($scope.Actions.Popup) && ($scope.Actions.Popup.close());
        },
        Save: function () {
            if (!$scope.EditTemplate.EmailNotificationTemplate.Name) {
                $.notify('Enter valid template name', { type: 'error' });
                return false;
            }

            var hasDuplicate = false;
            $.each($scope.EmailTemplates, function () {
                if (this.Name == $scope.EditTemplate.EmailNotificationTemplate.Name && $scope.EditTemplate.EmailNotificationTemplate.ID != this.ID)
                    hasDuplicate = true;
            });

            if (hasDuplicate) {
                $.notify('Template name already exist', {type:'error'});
                return false;
            }
            EmailTemplateService.update($scope.EditTemplate).then(function (data) {
                $scope.Actions.Close();
                $.notify('Saved successfully', { type: 'success' });
                $scope.getEmailTemplates();
            });
        }
    };

    $scope.GridConfig = {
        rows: $scope.EmailTemplate,
        actions: [{
            name: 'Edit',
            displayType: 'button',
            iconClass: 'fa fa-edit',
            //textTemplate: '<i class="fa fa-edit"></i>',
            isGeneralAction: false,
            actionType: 'function',
            action: "Edit"
        }, {
            name: 'Delete',
            displayType: 'button',
            iconClass: 'fa fa-trash',
            //textTemplate: '<i class="fa fa-edit"></i>',
            isGeneralAction: false,
            actionType: 'function',
            action: "Delete"
        }],
        pageSize: 20,
        columns: [{
            name: 'Name',
            value: 'Name'
        },
        {
            name: 'UpdatedBy',
            value: 'UpdatedBy'
        },
        {
            name: 'UpdatedOn',
            value: 'UpdatedOn'
        },
        ],
        actionReference: $scope.Actions
    };

}]);