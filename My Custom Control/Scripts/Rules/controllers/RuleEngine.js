var APP = angular.module('RuleEngine', ['glams.audit']),
    EDITOR = '.editor',
    ACTIVE_NODE = EDITOR + ' .active',
    OPERAND = 'operand',
    OPERAND_LEFT = 'OperandLeft',
    OPERAND_RIGHT = 'OperandRight',
    BOOL = 'Bool',
    STATEMENT = 'Statement',
    CONDITION = 'condition',
    OPERATOR = 'operator',
    AUTOCOMPLETE = 'autocomplete',
    CURSOR = '.cursor',
    CONTENTEDITABLE = '[type="text"]',
    END_OF_CONDITION = '.then',
    THEN = 'Then',
    CODE = '.code',
    ACTIVE = '.active',
    BLOCK = '.block';
CONSTANT = '.constant';
(function ($) {
    APP.factory("KeyWordService", [
        '$http', '$q',
        function ($http, $q) {
            var httpRestValue = path + 'api/Rule/';
            var KeyWordService = {
                data: {
                    operator: {
                        Default: ['Equals', 'NotEqual', 'GreaterThan', 'LessThan', 'GreaterThanEqual', 'LessThanEqual'],
                        Boolean: ['And', 'Or', 'Then']
                    },
                    operand: [],
                },

                loadWorkflowActions: function () {
                    var deferObj = $q.defer();
                    $http.get(httpRestValue + "GetActions", { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            deferObj.resolve(data);
                        })
                        .error(function error() { });
                    return deferObj.promise;
                },

                getOperator: function (id) {
                    return KeyWordService.data.operator;
                },
                getOperand: function (type, id) {
                    var deferObj = $q.defer();
                    showLoader();
                    $http.get(httpRestValue + "GetOperands?type=" + type + "&oID=" + id, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            KeyWordService.data.operand = data;
                            removeLoader();
                            deferObj.resolve(data);
                        })
                        .error(function error() { removeLoader(); });
                    return deferObj.promise;
                },
            };
            return KeyWordService;
        }]);

    APP.factory("RuleEngineService", [
        '$http', '$q',
        function ($http, $q) {
            var httpRestValue = path + 'api/Rule/';
            var urlParam = window.location.href.split('/');
            var ruleID = urlParam[urlParam.length - 1];

            var RuleEngineService = {
                data: {
                    Templates: [],
                    Code: [],
                    RuleTypeObjects: []
                },
                getTemplates: function () {
                    var deferObj = $q.defer();
                    $http.get(httpRestValue + "GetRules?ID=" + ruleID, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            RuleEngineService.data.Templates = data;
                            deferObj.resolve(data);
                        })
                        .error(function error() { });
                    return deferObj.promise;
                },
                loadTemplate: function (id) {
                    var deferObj = $q.defer();
                    showLoader();
                    $http.get(httpRestValue + "GetRuleSet?Id=" + id, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            removeLoader();
                            var uiCode = JSON.parse(data.UICode);
                            uiCode.ID = data.ID;
                            uiCode.SubType = data.SubType;
                            RuleEngineService.data.Code = uiCode;
                            deferObj.resolve(uiCode);
                        })
                        .error(function error() { removeLoader(); });
                    return deferObj.promise;
                },
                copyTemplate: function (id) {
                    return RuleEngineService.loadTemplate(id);
                },
                loadRuleTypes: function (type) {
                    var deferObj = $q.defer();
                    $http.get(httpRestValue + "GetRuleObjects?RuleType=" + type, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                        .success(function success(data) {
                            RuleEngineService.data.RuleTypeObjects = data;
                            deferObj.resolve(data);
                        })
                        .error(function error() { });
                    return deferObj.promise;
                },
                save: function (codeObj) {
                    var deferObj = $q.defer();
                    showLoader();
                    $http({
                        url: httpRestValue + "SaveRuleObjects",
                        method: 'POST',
                        data: codeObj,
                        headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
                    }).success(function success(data) {
                        removeLoader();
                        deferObj.resolve(data);
                    })
                        .error(function error() {
                            removeLoader();
                            deferObj.resolve('Error');
                        });
                    return deferObj.promise;
                },
                delete: function (templateObj) {
                    var deferObj = $q.defer();
                    showLoader();
                    //$http.get(httpRestValue + "Delete?id=" + templateObj.ID, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } })
                    $http({
                        url: httpRestValue + "Defunct?ids=" + templateObj.ID,
                        method: 'POST',
                        //data: templateObj.ID,
                        headers: { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" },
                    })
                    .success(function success(data) {
                        removeLoader();
                        deferObj.resolve(templateObj);
                    }).error(function error() {
                        removeLoader();
                        deferObj.resolve('Error');
                    });
                    return deferObj.promise;
                }
            };
            return RuleEngineService;
        }]);

    APP.controller('RuleEngineController', ['$scope', '$http', '$compile', '$timeout', 'KeyWordService', 'RuleEngineService', 'Audit',
        function ($scope, $http, $compile, $timeout, KeyWordService, RuleEngineService, Audit) {
            $scope.Temp = {
                Name: "",
                Type: "",
                SubType: ""
            };

            var urlParam = window.location.href.split('/');
            $scope.RuleID = urlParam[urlParam.length - 1];

            $scope.filter = "";

            $scope.RuleType = ["Workflow", "Task", "Form"];

            $scope.RuleSubType = "";

            $scope.TypeObjects = [];

            $scope.Templates = [];

            $scope.codeStack = [];

            $scope.code = {
                ID: 0,
                Name: "",
                Type: "",
                SubType: "",
                CodeStack: $scope.codeStack
            };

            $scope.KeywordArray = {
                Bool: [],
                operator: [],
                operand: []
            };

            $scope.init = function () {
                $scope.loadTemplates();
            };

            $scope.loadOperators = function () {
                var operator = KeyWordService.getOperator();

                $scope.KeywordArray.Bool = operator.Boolean;
                $scope.KeywordArray.operator = operator.Default;
            };

            $scope.loadKeywords = function (type, id) {
                $scope.loadOperators();

                var promise = KeyWordService.getOperand(type, id);
                promise.then(function (data) {
                    $scope.KeywordArray.operand = data;
                });

                $scope.loadActions(type);
            };

            $scope.loadActions = function (type) {
                switch (type) {
                    case 'Workflow':
                        var wpromise = KeyWordService.loadWorkflowActions();
                        wpromise.then(function (data) {
                            $scope.WorkflowActions = data;
                        });
                        break;
                }
            };

            $scope.loadTemplates = function () {
                var promise = RuleEngineService.getTemplates();
                promise.then(function (data) {
                    $scope.Templates = data;
                });
            };

            $scope.Rule = {
                init: function () {
                    $scope.Rule.setSubTypeName();
                    $scope.NAVUtil.init();
                    $(EDITOR).focus();
                    $timeout(function () {
                        $scope.NAVUtil.moveCursor($(CODE).first());
                    }, 100);
                },

                setSubTypeName: function () {
                    if (RuleEngineService.data.RuleTypeObjects.length > 0) {
                        $scope.RuleSubType = $scope.Rule.getRuleSubTypeName(RuleEngineService.data.RuleTypeObjects);
                    }
                    else {
                        var promise = RuleEngineService.loadRuleTypes($scope.code.Type);
                        promise.then(function (data) {
                            $scope.RuleSubType = $scope.Rule.getRuleSubTypeName(data);
                        });
                    }
                },

                getRuleSubTypeName: function (ruleObjects) {
                    var templateName = "";
                    $.each(ruleObjects, function (i, rt) {
                        if (rt.ID == $scope.code.SubType)
                            templateName = rt.Name;
                    });
                    return templateName;
                },

                getRuleType: function (RuleTypeId) {
                    var RuleType = '';
                    switch (RuleTypeId) {
                        case 1:
                            RuleType = 'form';
                            break;
                        case 2:
                            RuleType = 'task';
                            break;
                        case 3:
                            RuleType = 'workflow';
                            break;
                    }
                    return RuleType;
                },

                getRuleTypeImage: function (RuleTypeId) {
                    return '../../Content/Rules/images/' + $scope.Rule.getRuleType(RuleTypeId) + '.png';
                },

                sortHandler: function (event, ui) {
                    var start = ui.item.data('start'),
                        end = ui.item.index();
                    var p = ui.item.parent();

                    $scope.codeStack.splice(end, 0, $scope.codeStack.splice(start, 1)[0]);

                    $scope.$apply();
                },

                sortValueHandler: function (event, ui) {
                    var start = ui.item.data('start'),
                        end = ui.item.index();
                    var p = ui.item.parent();
                    var eValue = angular.element(ui.item).scope().$parent.$parent.$parent.e.Action.StringValue;
                    eValue.splice(end, 0, eValue.splice(start, 1)[0]);

                    $scope.$apply();
                },

                addRule: function (event) {
                    event.preventDefault();
                    var template = $compile('<div ng-include="\'addrule.html\'"></div>')($scope);
                    var popup = PopUpWindow("New Rule", template, {
                        width: 600,
                        height: 250
                    });
                    $scope.Temp.Name = "";
                    $scope.Temp.Type = "";
                    $scope.Temp.SubType = "";

                    $timeout(function () {
                        popup.popup.find('input').first().focus();
                    }, 200);

                    $(popup.controls[0]).val('Create').on('click', function () {
                        var msg = "";
                        if ($.trim($scope.Temp.Name).length == 0)
                            msg = " - Enter valid Name\n";
                        if ($scope.Temp.Type == "")
                            msg = msg + " - Select Rule type\n";
                        if ($scope.Temp.SubType == "")
                            msg = msg + " - Select Rule Object\n";

                        if (msg != "")
                            alert(msg);
                        else {
                            $scope.codeStack = [];

                            $scope.code.ID = 0;
                            $scope.code.Name = $scope.Temp.Name;
                            $scope.code.Type = $scope.Temp.Type;
                            $scope.code.SubType = $scope.Temp.SubType;

                            $scope.CODEUtil.insertBlock();
                            $scope.NAVUtil.init();

                            $scope.Temp.Name = "";
                            $scope.Temp.Type = "";
                            $scope.Temp.SubType = "";

                            popup.close();
                            $scope.loadKeywords($scope.code.Type, $scope.code.SubType);
                            $scope.loadTemplates();
                            $scope.Rule.setSubTypeName();
                            $scope.$apply();
                        }
                    });
                },

                load: function (index) {
                    var template = $scope.Templates[index];
                    var promise = RuleEngineService.loadTemplate(template.ID);
                    promise.then(function (uiCode) {
                        $scope.loadActions(uiCode.Type);
                        var kpromise = KeyWordService.getOperand(uiCode.Type, uiCode.SubType);
                        kpromise.then(function (data) {
                            $scope.loadOperators();
                            $scope.KeywordArray.operand = data;
                            $scope.code.ID = uiCode.ID;
                            $scope.code.Name = uiCode.Name;
                            $scope.code.Type = uiCode.Type;
                            $scope.code.SubType = uiCode.SubType;
                            $scope.codeStack = uiCode.CodeStack;

                            $scope.Audit = $.extend(true, {}, $scope.code);
                            $scope.Audit.CodeStack = $.extend(true, [],$scope.codeStack);

                            $scope.Rule.init();
                        });
                    });
                },

                copy: function (index) {
                    if ($scope.codeStack.length) {
                        var template = $scope.Templates[index];
                        var promise = RuleEngineService.copyTemplate(template.ID);
                        promise.then(function (data) {
                            $scope.codeStack = data.CodeStack;
                            $scope.Rule.init();
                        });
                    }
                    else {
                        alert('Create or Choose a template');
                    }
                },

                save: function () {
                    $scope.code.CodeStack = $scope.codeStack;
                    if ($scope.code.CodeStack.length > 0) {
                        var promise = RuleEngineService.save($scope.Rule.buildCodeObject($scope.code));
                        promise.then(function (ruleObj) {
                            $scope.code.ID = ruleObj;
                            $scope.loadTemplates();
                            
                            function AuditDataHelper(objTemplate) {
                                objTemplate.ID = +objTemplate.ID;
                                objTemplate.AuditName = objTemplate.Name;
                                objTemplate['$$hashKey'] && (delete objTemplate['$$hashKey']);

                                for (var c = 0; c < objTemplate.CodeStack.length; c++) {
                                    var codeStack = objTemplate.CodeStack[c];

                                    for (var i = 0; i < codeStack.length; i++) {
                                        var ruleBlock = codeStack[i];
                                        ruleBlock.AuditName = objTemplate.AuditName + " -> Action(" + ruleBlock.Name + ")";
                                        ruleBlock['$$hashKey'] && (delete ruleBlock['$$hashKey']);
                                    }

                                    codeStack['$$hashKey'] && (delete codeStack['$$hashKey']);
                                }

                                return objTemplate;
                            }

                            var newAudit = $.extend(true, {}, $scope.code);
                            
                            Audit.log(Audit.Type.RULES, $scope.Audit, newAudit, AuditDataHelper).then(function () {
                                $.notify('Rule saved successfully', { position: 'bottom right', type: 'success' });
                            });
                        }, function (err) {
                            $.notify("Unable to process your request. Please try again", { position: 'bottom right', type: 'error' });
                        });
                    }
                },

                delete: function (index) {
                    if (confirm('Are you sure want to delete?')) {
                        var selectedTemplate = $.extend(true, {}, $scope.Templates[index]);
                        var promise = RuleEngineService.delete(selectedTemplate);
                        promise.then(function (templateObj) {
                            $scope.loadTemplates();
                            if (selectedTemplate.ID == $scope.code.ID) {
                                $scope.Rule.closeCurrentRule();
                                $scope.NAVUtil.init();
                            }

                            $.notify('Rule deleted successfully', { position: 'bottom right', type: 'success' });
                        }, function (err) {
                            $.notify("Unable to process your request. Please try again", { position: 'bottom right', type: 'error' });
                        });
                    }
                },

                closeCurrentRule: function () {
                    $scope.codeStack = [];

                    $scope.code.ID = 0;
                    $scope.code.Name = "";
                    $scope.code.Type = "";
                    $scope.code.SubType = "";
                    $scope.code.CodeStack = [];
                    $scope.RuleSubType = "";
                },

                close: function () {
                    window.parent.glams.modal.getAll()[0].close();
                },

                buildCodeObject: function (code) {
                    var codeObj = {};

                    codeObj.ID = code.ID;

                    codeObj.Name = code.Name;

                    codeObj.Type = code.Type;

                    codeObj.SubType = code.SubType;

                    codeObj.ParentID = $scope.RuleID;

                    codeObj.UpdatedBy = '00000000-0000-0000-0000-000000000000';

                    codeObj.UICode = JSON.stringify(code);

                    codeObj.Codeblocks = [];

                    $.each(code.CodeStack, function (i, cb) {
                        var codeBlock = {};
                        codeBlock.Condition = [];
                        codeBlock.Action = [];

                        var statementCounter = 0;

                        for (var j = 0; j < cb.length; j += 4) {
                            var obj = {};
                            obj.Property = cb[j].Name;
                            obj.ConditionType = cb[j + 1].Name;
                            obj.OperatorType = cb[j + 3].Name;
                            obj.Value = cb[j + 2].Name;
                            obj.Object = cb[j].Object;
                            obj.Type = cb[j].Type;

                            codeBlock.Condition.push(obj);

                            if (cb[j + 3].Name == THEN) {
                                statementCounter = j + 4;
                                break;
                            }
                        }

                        for (var k = statementCounter; k < cb.length; k++) {
                            var condObj = {};
                            condObj.Property = cb[k].Value.toString();
                            condObj.BoolOption = cb[k].Action.BoolOption;
                            condObj.StringValue = cb[k].Action.StringValue.toString() == "" ? cb[k].Value.toString() : cb[k].Action.StringValue.toString();
                            condObj.ActionType = cb[k].Action.ActionType;
                            condObj.Object = cb[k].Object;
                            condObj.Type = cb[k].Type;

                            codeBlock.Action.push(condObj);
                        }

                        codeObj.Codeblocks.push(codeBlock);
                    });

                    return codeObj;

                },

                loadRuleTypes: function () {
                    var promise = RuleEngineService.loadRuleTypes($scope.Temp.Type);
                    promise.then(function (data) {
                        $scope.TypeObjects = data;
                    });
                }
            };

            $scope.Utility = {
                isArray: function (obj) {
                    return angular.isArray(obj);
                }
            };
        }
    ]);
})(jQuery);