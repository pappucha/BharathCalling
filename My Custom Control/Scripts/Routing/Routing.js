angular.module("Routing", ['glams.audit'])

.constant('RoutingConfig', {
    CanvasSize: {
        width: 2000,
        height: 2000
    },
    Container: '.drawing-container',
    previewContainer: '#preview .w_cnt',
    previewHandle: '.handle',
    propertyGrid: '#property-grid',
    maxZoom: 0.1,
    minZoom: -100,
    nodeMinHeight: 36,
    nodeMinWidth: 80,
    charWidth: 7.5,
    charHeight: 10,
    nodeBtnRadius: 10,
    nodeStyle: {
        fill: '135-#eee-#f9f9f9',
        opacity: 0.5,
        stroke: '#000',
        'stroke-width': 2,
        cursor: 'move'
    },
    stageStyle: {
        fill: '135-#eee-#fc0',
        opacity: 0.5,
        stroke: '#000',
        'stroke-width': 2,
        cursor: 'move'
    },
    textStyle: {
        'font-size': 12,
        fill: '#333',
        cursor: 'move'
    },
    addBtnStyle: {
        fill: '45-green-lightgreen',
        stroke: 'rgba(20, 65, 0, 0.5)',
        'stroke-width': 2,
        cursor: 'pointer'
    },
    delBtnStyle: {
        fill: '45-red-#FFC0C0',
        stroke: 'rgba(70, 8, 8, 0.5)',
        cursor: 'pointer',
        'stroke-width': 2
    },
    btnTxtStyle: {
        fill: '#000',
        'font-size': 14,
        'font-weight': 'bold',
        cursor: 'pointer'
    },
    connectorStyle: {
        stroke: 'rgba(67, 44, 0, 0.5)',
        cursor: 'crosshair',
        'stroke-width': 2,
        fill: '#b23020'
    }
})

.directive('draggable', function () {
    return {
        restrict: 'A',
        scope: {
            draggable: '='
        },
        link: function (scope, element, attrs) {
            $(element).draggable(scope.draggable || {});
            $(element).on('mousedown', function () {
                $('.ui-draggable').css('z-index', 1);
                $(this).css('z-index', 10);
            });
        }
    }
})

.directive('droppable', function () {
    return {
        restrict: 'A',
        scope: {
            ondrop: '=droppable',
        },
        link: function (scope, element, attrs) {
            $(element).droppable({
                accept: '.template',
                drop: scope.ondrop
            });
        }
    };
})

.factory('RoutingService', function ($q, $http) {
    var RoutingService = {};
    var ServiceURL = {
        getRoutingTemplate: path + 'api/Routing/GetRoutingTemplates',
        getTaskTemplate: path + 'api/Workflow/GetTaskTemplates',
        getUserInGroups: path + 'api/Routing/GetUserInGroups',
        getUsers: path + 'api/Routing/GetUsers',
        getGroups: path + 'api/Routing/GetGroups',
        getGroupTypes: path + 'api/Routing/GetGroupTypes',
        getWorkflow: path + 'api/Routing/GetWorkflow',
        getItemInfo: path + 'api/Routing/GetItemInfo',
        saveRoutingTemplate: path + 'api/Routing/UpdateRoutingTemplate',
        submitRouting: path + 'api/Routing/UpdateRouting',
        deleteRoutingTemplate: path + 'api/Routing/DeleteRoutingTemplate?name=',
        getRoutingByName: path + 'api/Routing/GetRouting?name=',
        updateHeader: path + 'api/Routing/UpdateHeader?id=',
    };
    var Request = function (method, url, data, header) {
        var d = $q.defer();
        $http({
            method: method,
            url: url,
            data: data,
            headers: header
        }).success(function (data) {
            d.resolve(data);
        }).error(function (err) {
            d.reject(err);
        });
        return d.promise;
    };

    RoutingService.getRoutingTemplate = function () {
        return Request('GET', ServiceURL.getRoutingTemplate, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.getTaskTemplate = function () {
        return Request('GET', ServiceURL.getTaskTemplate, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.getUserInGroups = function () {
        return Request('GET', ServiceURL.getUserInGroups, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.getUsers = function () {
        return Request('GET', ServiceURL.getUsers, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.getGroupTypes = function () {
        return Request('GET', ServiceURL.getGroupTypes, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.getGroups = function () {
        return Request('GET', ServiceURL.getGroups, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.getRoutingByName = function (data) {
        return Request('GET', ServiceURL.getRoutingByName + data, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.getWorkflow = function () {
        return Request('GET', ServiceURL.getWorkflow, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.getItemInfo = function () {
        return Request('GET', ServiceURL.getItemInfo, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.saveRoutingTemplate = function (data) {
        return Request('POST', ServiceURL.saveRoutingTemplate, data, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.submitRouting = function (data) {
        return Request('POST', ServiceURL.submitRouting, data, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.deleteRoutingTemplate = function (data) {
        return Request('POST', ServiceURL.deleteRoutingTemplate + data, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    RoutingService.loadInitialData = function () {
        return $q.all([
                        RoutingService.getRoutingTemplate(),
                        RoutingService.getUserInGroups(),
                        RoutingService.getUsers(),
                        RoutingService.getGroupTypes(),
                        RoutingService.getGroups(),
                        RoutingService.getWorkflow(),
                        RoutingService.getItemInfo()
        ]);
    }

    RoutingService.updateHeader = function (header) {
        return Request('GET', ServiceURL.updateHeader + header, null, { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" });
    };

    return RoutingService;
})

.controller('RoutingCntrl', ['$scope', '$compile', 'RoutingConfig', 'RoutingService', 'Audit',
function ($scope, $compile, RoutingConfig, RoutingService, Audit) {
    var GUID_NULL = '00000000-0000-0000-0000-000000000000';

    $scope.RoutingObj = [];

    $scope.Action = {
        init: function () {
            $scope.Action.initPreview();
        },
        toggleFullScreen: function () {
            var element = document.getElementsByTagName('html')[0];
            if ($scope.toggleFullscreen) {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        },
        CloneNode: function (node) {
            var data = node.info,
                pos = node.getBBox(),
                cNode = $scope.Draw.Node(pos.x + 15, pos.y + 15, data.text),
                task = $.extend(true, {}, node.task);

            task.ID = uuid();
            task.Parents = [];
            task.Childrens = [];

            cNode.task = task;

            $scope.Action.createPreview();
        },
        DeleteNode: function (node) {
            $scope.Action.removeConnection(node);
            $scope.Action.hideProperties();
            var index = $.inArray(node, $scope.Data.Nodes);
            (index >= 0) && ($scope.Data.Nodes.splice(index, 1));
            node.remove();
            $scope.$apply(function () {
                $scope.Action.createPreview();
            });
        },
        removeConnection: function (node) {
            var tElm = node[2];
            var iArr = [];
            _.each($scope.Data.Connections, function (c, i) {
                if (c.from == tElm || c.to == tElm) {
                    iArr.push(i);
                    c.line.remove();
                    c.bg.remove();
                }
            });
            _.each(iArr, function (ci, i) {
                $scope.Data.Connections.splice(ci - i, 1);
            });

            _.each($scope.Data.Nodes, function (s) {
                var sI = $.inArray(node.task.ID, s.task.Childrens),
                dI = $.inArray(node.task.ID, s.task.Parents);

                (sI >= 0) && s.task.Childrens.splice(sI, 1);
                (dI >= 0) && s.task.Parents.splice(dI, 1);

                s.task.ChildCount = s.task.Childrens.length;
                s.task.ParentCount = s.task.Parents.length;
            });

            $scope.Action.createPreview();
        },
        removeConnectionByLine: function (line) {
            _.each($scope.Data.Connections, function (c, i) {
                if (c && (c.line == line)) {
                    c.line.remove();
                    c.bg.remove();
                    $scope.Data.Connections.splice(i, 1);

                    var dpi = $.inArray(c.source.task.ID, c.destination.task.Parents),
                    sci = $.inArray(c.destination.task.ID, c.source.task.Childrens);

                    (dpi >= 0) && c.destination.task.Parents.splice(dpi, 1);
                    (sci >= 0) && c.source.task.Childrens.splice(sci, 1);

                    c.destination.task.ParentCount = c.destination.task.Parents.length;
                    c.source.task.ChildCount = c.source.task.Childrens.length;
                }
            });
        },
        initPreview: function () {
            $(RoutingConfig.previewHandle).draggable({
                containment: 'parent',
                drag: function (event, ui) {
                    var pc = $(RoutingConfig.previewContainer);
                    var pos = {
                        left: (ui.position.left * RoutingConfig.CanvasSize.width / pc.width()) * -1,
                        top: (ui.position.top * RoutingConfig.CanvasSize.height / pc.height()) * -1
                    };
                    $($scope.Canvas.canvas).css(pos);
                }
            });
        },
        createPreview: function () {
            $(RoutingConfig.previewContainer).children().not(RoutingConfig.previewHandle).remove();
            var p = $($scope.Canvas.canvas).clone().css({
                left: 0,
                top: 0
            }),
                pc = $(RoutingConfig.previewContainer),
                l = [],
                t = [];

            p.width(pc.width()).height(pc.height());
            p.appendTo(RoutingConfig.previewContainer);

            _.each($scope.Data.Nodes, function (s) {
                if (!s)
                    return;
                var p = s.getBBox();
                if (p) {
                    l.push(p.x2);
                    t.push(p.y2);
                }
            });

            var dw = Math.max.apply(null, l),
                dh = Math.max.apply(null, t);

            var w = $scope.Util.windowSize().width / RoutingConfig.CanvasSize.width * (pc.width() - 4),
                h = $scope.Util.windowSize().height / RoutingConfig.CanvasSize.height * (pc.height() - 4);
            w = w > (pc.width() - 4) ? (pc.width() - 4) : w;
            h = h > (pc.height() - 4) ? (pc.height() - 4) : h;
            if (isFinite(w) && isFinite(h)) {
                RoutingConfig.CanvasSize.width = dw > (RoutingConfig.CanvasSize.width - 200) ? RoutingConfig.CanvasSize.width + 200 : RoutingConfig.CanvasSize.width;
                RoutingConfig.CanvasSize.height = dh > (RoutingConfig.CanvasSize.height - 200) ? RoutingConfig.CanvasSize.height + 200 : RoutingConfig.CanvasSize.height;
                $scope.Canvas.setSize(RoutingConfig.CanvasSize.width, RoutingConfig.CanvasSize.height);

                p[0].setAttribute('viewBox', '0 0 ' + RoutingConfig.CanvasSize.width + ' ' + RoutingConfig.CanvasSize.height);
                $(RoutingConfig.previewContainer).find(RoutingConfig.previewHandle).width(w).height(h);
            }
        },
        showProperties: function (node) {
            $scope.togglePropertyWindow = true;
            $scope.Util.populatePropertyData(node);
        },
        hideProperties: function () {
            $scope.togglePropertyWindow = false;
        },
        createTask: function (prop, type) {
            var task = {};
            task.ID = uuid();
            task.Stage = '';
            task.TaskType = type || '';
            task.TaskTeamplateID = (prop) ? prop.ID : 0;
            task.TaskTemplateName = (prop) ? prop.Name : "";
            task.UrgID = '00000000-0000-0000-0000-000000000000';
            task.GroupID = '00000000-0000-0000-0000-000000000000';
            task.Duration = 0;
            task.ParentCount = 0;
            task.ParentCounter = 0;
            task.ChildCount = 0;
            task.ChildString = '';
            task.JobID = 0;
            task.ItemID = 0;
            task.Parents = [];
            task.Childrens = [];
            task.Styles = { 'left': 0 + 'px', 'top': 0 + 'px' };

            return task;
        },
        deleteRoutingTemplate: function (name) {
            $.confirm('Are you sure want to delete?', {
                onComplete: function (op) {
                    if (op == 'Yes') {
                        RoutingService.deleteRoutingTemplate(name).then(function (data) {
                            var index = $.inArray(name, $scope.Data.RoutingTemplate);
                            (index >= 0) && ($scope.Data.RoutingTemplate.splice(index, 1));
                            $.notify('Routing template deleted successfully', { type: 'success' });
                        });
                    }
                }
            });
        },
        submitRouting: function () {
            var workflowObj = $scope.Util.getWorkFlowTemplate();

            var newAudit = $.extend(true, {}, workflowObj);

            function auditDataHelper(r) {

                for (var i = 0; i < r.StageTemplates.length; i++) {

                    if (r.StageTemplates[i]) {

                        r.StageTemplates[i].AuditName = "Workflow(" + r.Name + ") -> Stage(" + r.StageTemplates[i].Name + ")";

                        for (var j = 0; j < r.StageTemplates[i].Tasks.length; j++) {
                            if (r.StageTemplates[i].Tasks[j]) {
                                r.StageTemplates[i].Tasks[j].AuditName = r.StageTemplates[i].AuditName + " -> Task(" + r.StageTemplates[i].Tasks[j].TaskTemplateName + ")";
                                r.StageTemplates[i].Tasks[j]['$$hashKey'] && (delete r.StageTemplates[i].Tasks[j]['$$hashKey']);
                                r.StageTemplates[i].Tasks[j].Childrens = [];
                                r.StageTemplates[i].Tasks[j].Parents = [];
                                r.StageTemplates[i].Tasks[j].ChildCount = 0;
                                r.StageTemplates[i].Tasks[j].ParentCount = 0;
                            }
                        }

                        r.StageTemplates[i]['$$hashKey'] && (delete r.StageTemplates[i]['$$hashKey']);
                    }
                }

                r.AuditName = r.Name;
                r['$$hashKey'] && (delete r['$$hashKey']);

                return r;
            };
            
            RoutingService.submitRouting(workflowObj).then(function () {
                Audit.log(Audit.Type.ROUTING, $scope.Audit, newAudit, auditDataHelper).then(function () {
                    $scope.Audit = newAudit;
                    $.notify("Routing submitted successfully", { type: 'success' });
                    var pScope = window.parent.angular.element('[ng-controller="LayoutRendererCntrl"]').scope();
                    pScope.Handlers.post($scope.Data.RoutingObj[0]);
                });
            });
        },
        saveRoutingTemplate: function () {
            $.prompt("Enter Template Name", {
                onComplete: function (opt, value) {
                    if (opt == 'Ok') {
                        if (!value)
                            return false;
                        else {
                            var duplicate = _.filter($scope.Data.RoutingTemplate, function (rt) {
                                return rt.toLowerCase() == value.toLowerCase();
                            });
                            if (duplicate.length) {
                                $.confirm('Template with same name already exist. Do you want to overwrite?', {
                                    onComplete: function (op) {
                                        if (op == 'Yes') {
                                            $scope.Action.saveRouting(value);
                                        }
                                    }
                                });
                            }
                            else {
                                $scope.Action.saveRouting(value);
                            }
                        }
                    }
                }
            });
        },
        saveRouting: function (name) {
            var workflowObj = $scope.Util.getWorkFlowTemplate();
            workflowObj.Name = name;
            RoutingService.saveRoutingTemplate(workflowObj).then(function () {
                var index = $.inArray(name, $scope.Data.RoutingTemplate);
                (index < 0) && ($scope.Data.RoutingTemplate.push(name));
                $.notify("Routing saved successfully", { type: 'success' });
            });
        },
        close: function () {
            window.top.glams.modal.getAll()[0].close();
        }
    };

    $scope.Util = {
        windowSize: function () {
            return { width: (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth), height: (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) };
        },
        hasConnection: function (src, dest) {
            var hasDuplicate = false;
            $($scope.Data.Connections).each(function (i, c) {
                if ((c.from == src && c.to == dest) || (c.from == dest && c.to == src))
                    hasDuplicate = true;
            });
            return hasDuplicate;
        },
        populateNewPropertyData: function (node) {
            var setObj = {}, metObj = {};

            //GroupType
            setObj['GroupTypes'] = $scope.Util.getGroupTypeById(node.task.GroupTypeID);
            metObj['GroupTypes'] = {};
            metObj['GroupTypes'].type = 'options';
            metObj['GroupTypes'].options = [];
            metObj['GroupTypes'].options.push('');
            _.each($scope.Data.GroupTypes, function (g) {
                metObj['GroupTypes'].options.push({ value: g.Name, text: g.Name });
            });


            //Groups
            setObj['Groups'] = $scope.Util.getGroupNameById(node.task.GroupID);
            metObj['Groups'] = {};
            metObj['Groups'].type = 'options';
            metObj['Groups'].options = $scope.Util.getGroupData(setObj['GroupTypes']);
            metObj['Groups'].options.splice(0, 0, '');

            //Users
            setObj["Users"] = $scope.Util.getUserObjById(node.task.UrgID).m_Item2 || '';
            metObj["Users"] = {};
            metObj["Users"].type = "options";
            metObj["Users"].options = $scope.Util.getUsers(node.task.GroupID);
            metObj['Users'].options.splice(0, 0, '');

            //duration
            setObj["Duration"] = node.task.Duration || 0;
            metObj["Duration"] = {};

            node.PropertyValue = [setObj, metObj];
            return [setObj, metObj];
        },
        populatePropertyData: function (node) {
            console.log(node);
            var setObj, metObj, row;
            row = $scope.Util.populateNewPropertyData(node);

            setObj = row[0];
            metObj = row[1];

            function GroupTypeChangeHandler() {
                var value = this.value;
                setObj["GroupTypes"] = value;

                node.task.GroupTypeID = $scope.Util.getGroupTypeByName(value);
                //reset group
                setObj["Groups"] = '';
                metObj["Groups"].options = $scope.Util.getGroupData(value);
                metObj["Groups"].options.splice(0, 0, '');

                //reset users
                setObj["Users"] = '';
                metObj["Users"].options = [];
                ChangeHandler();
            }

            function GroupChangeHandler() {
                var value = this.value;
                var grpID = $scope.Util.getGroupId(value);
                setObj["Groups"] = value;
                node.task.UrgID = grpID;
                node.task.GroupID = grpID;
                metObj["Users"].options = $scope.Util.getUsers(grpID);
                metObj["Users"].options.splice(0, 0, '');
                ChangeHandler();
            }

            function UsersChangeHandler() {
                var value = this.value;
                setObj["Users"] = value;
                node.task.UrgID = value;
            }

            function DurationChangeHandler() {
                console.log(this.value);
                var value = this.value;
                setObj["Duration"] = value;
                node.task.Duration = +value ? value : 0;
            }

            function ChangeHandler() {
                var pg = $(RoutingConfig.propertyGrid);
                pg.jqPropertyGrid(setObj, metObj);
                pg.find('select').eq(0).on('change', GroupTypeChangeHandler);
                pg.find('select').eq(1).on('change', GroupChangeHandler);
                pg.find('select').eq(2).on('change', UsersChangeHandler);
                pg.find('input').eq(0).on('keyup', DurationChangeHandler);
            }
            ChangeHandler();
        },
        getGroupTypeValue: function (groupValue) {
            var gtValue = '';
            if (groupValue != GUID_NULL) {
                _.each($scope.Data.Groups, function (g) {
                    if (groupValue == g.GroupID)
                        gtValue = g.FK_MasterListID;
                });
            }
            return gtValue;
        },
        getGroupId: function (groupName) {
            var gt = _.filter($scope.Data.Groups, function (g) {
                return g.Name == groupName;
            });
            return gt.length ? gt[0].GroupID : GUID_NULL;
        },
        getGroupNameById: function (groupId) {
            var gt = _.filter($scope.Data.Groups, function (g) {
                return g.GroupID == groupId;
            });
            return gt.length ? gt[0].Name : '';
        },
        getGroupByIntegerId: function (groupId) {
            var gt = _.filter($scope.Data.Groups, function (g) {
                return g.ID == groupId;
            });
            return gt.length ? gt[0] : '';
        },
        getGroupTypeByName: function (groupTypeName) {
            var gt = _.filter($scope.Data.GroupTypes, function (g) {
                return g.Name == groupTypeName;
            });
            return gt.length ? gt[0].ID : '';
        },
        getGroupTypeById: function (groupTypeID) {
            var gt = _.filter($scope.Data.GroupTypes, function (g) {
                return g.ID == groupTypeID;
            });
            return gt.length ? gt[0].Name : '';
        },
        getUserId: function (userName) {
            var u = _.filter($scope.Data.Users, function (us) {
                return us.m_Item1 == userName;
            });
            return u.length ? u[0].m_Item2 : GUID_NULL;
        },
        getUserObjById: function (userID) {
            var u = _.filter($scope.Data.Users, function (us) {
                return us.m_Item2 == userID;
            });
            return u.length ? u[0] : {};
        },
        getGroupData: function (groupType) {
            var data = [],
                groupTypeId = $scope.Util.getGroupTypeByName(groupType);

            if (groupTypeId)
                _.each($scope.Data.Groups, function (g) {
                    if (groupTypeId == g.FK_MasterListID)
                        data.push({ value: g.Name, text: g.Name });
                });
            return data;
        },
        getUsers: function (grpID) {
            var users = [];
            _.filter($scope.Data.UsersInGroups, function (uig) {
                if (uig.GroupId == grpID) {
                    _.filter($scope.Data.Users, function (us) {
                        if (us.m_Item2 == uig.UserId) {
                            users.push({ text: us.m_Item1, value: us.m_Item2 });
                        }
                    });
                }
            });

            return users;
        },
        getParents: function (tasks) {
            return _.filter(tasks, function (t) {
                return !t.task.ParentCount;
            });
        },
        getNodeById: function (nid) {
            return _.filter($scope.Data.Nodes, function (n) {
                return n.task.ID == nid;
            });
        },
        getChildren: function (tasks, parentTask) {
            return _.filter(tasks, function (t) {
                return $.inArray(parentTask.task.ID, t.task.Parents) >= 0;
            });
        },
        getWorkFlowTemplate: function () {
            var workflowObj = $.extend(true, {}, $scope.Data.Workflow),
                nodes = $.extend(true, [], $scope.Data.Nodes);

            _.each(nodes, function (n, i) {
                var childIndex = [];
                _.each(n.task.Childrens, function (c, ci) {
                    var cNode = $scope.Util.getNodeById(c)[0];
                    if (cNode && (cNode.task.Stage != n.task.Stage)) {
                        var index = $.inArray(n.task.ID, cNode.task.Parents);
                        if (index >= 0) {
                            cNode.task.Parents.splice(index, 1);
                            cNode.task.ParentCount = cNode.task.Parents.length;
                            childIndex.push(cNode.task.ID);
                        }
                    }
                });

                _.each(childIndex, function (cIndex) {
                    var index = $.inArray(cIndex, n.task.Childrens);
                    n.task.Childrens.splice(index, 1);
                });
                n.task.ChildCount = n.task.Childrens.length;
            });

            _.each(workflowObj.StageTemplates, function (st, j) {
                st.Tasks = [];
                _.each(nodes, function (n, i) {
                    if (st.Name == n.task.Stage) {
                        st.Tasks.push(n.task);
                    }
                });
            });
            return workflowObj;
        },
        getItemInfo: function (key) {
            var r = _.filter($scope.Data.ItemInfo, function (rinfo) {
                return key == rinfo.Name;
            });
            return (r.length) ? r[0].ValueString : undefined;
        }
    };

    $scope.Data = {
        reset: function () {
            $scope.Data.Nodes = [];
            $scope.Data.Connections = [];
            $scope.Data.Stages = [];
            $scope.Data.CurrentStage = '';
            $scope.Data.TaskTemplate = [];
            $scope.Data.RoutingTemplate = [];
            $scope.Data.Groups = [];
            $scope.Data.GroupTypes = [];
            $scope.isLoading = false;
        },
        Nodes: [],
        Connections: [],
        Users: [],
        Groups: [],
        GroupTypes: [],
        UsersInGroups: [],
        CurrentStage: '',
        ActiveStage: '',
        TaskTemplate: [],
        RoutingTemplate: [],
        Workflow: {},
        ItemInfo: [],
        RoutingObj: []
    };

    $scope.Event = {
        init: function () {
            $scope.Event.initCanvasDrag();
            $scope.Event.initConnector();
            $scope.Event.initWindowResize();
            //property grid combobox fix
            $(document).on('mousedown', '.combobox-item', function (e) {
                e.stopPropagation();
            });
        },
        initConnector: function () {
            $(RoutingConfig.Container).mouseup(function (e) {
                $(this).unbind('mousemove');
                var cLine = $(RoutingConfig.Container).data('cLine');
                var sElm = $(RoutingConfig.Container).data('sElm');
                if (cLine) {
                    cLine.remove();
                    var tElm = $scope.Canvas.getElementByPoint(e.pageX, e.pageY);
                    if (tElm && tElm.type == 'rect' && sElm != tElm) {
                        $scope.Draw.Connection(sElm, tElm);
                    }
                    $(RoutingConfig.Container).data('cLine', null);
                    $(RoutingConfig.Container).data('sElm', null);
                }
                _.each($scope.Data.Connections, function (c) {
                    c.line.attr({
                        "cursor": "pointer",
                        "stroke-width": 3,
                        "arrow-end": "classic-wide-large"
                    });
                });
                $scope.Action.createPreview();
            });

            $(RoutingConfig.Container).click(function (e) {
                e.stopPropagation();
                _.each($scope.Data.Nodes, function (g, i) {
                    if (!g)
                        return;

                    g[3].hide();
                    g[4].hide();
                    g[5].hide();
                });
                $scope.Action.hideProperties();
                $scope.Data.CurrentStage = '';
                $scope.$apply();
            });
        },
        initCanvasDrag: function () {
            $($scope.Canvas.canvas).draggable({
                grid: [1, 1],
                drag: function (event, ui) {
                    $scope.Event.canvasMove(ui.helper);
                },
                stop: function (event, ui) {
                    var obj = {};
                    var maxx = RoutingConfig.CanvasSize.width - $scope.Util.windowSize().width;
                    var maxy = RoutingConfig.CanvasSize.height - $scope.Util.windowSize().height;
                    obj.left = ui.position.left > 0 ? 0 : (Math.abs(ui.position.left) > maxx ? -maxx : ui.position.left);
                    obj.top = ui.position.top > 0 ? 0 : (Math.abs(ui.position.top) > maxy ? -maxy : ui.position.top);
                    ui.helper.animate(obj, {
                        duration: 100,
                        complete: function () {
                            $($scope.Canvas.canvas).trigger('click');
                            $scope.Event.canvasMove(ui.helper);
                        }
                    });
                }
            });
        },
        canvasMove: function (elm) {
            var ph = $(RoutingConfig.previewHandle),
                pc = $(RoutingConfig.previewContainer);
            var pos = {
                left: -1 * (elm.position().left * pc.width() / (elm).width()),
                top: -1 * (elm.position().top * pc.height() / (elm).height())
            };
            ph.css(pos);
        },
        initWindowResize: function () {
            $(window).resize(function () {
                $scope.Action.createPreview();
            });
        },
        Drop: function (event, ui) {
            //var src = ui.draggable;
            //var index = src.index();
            //var parentElm = $(RoutingConfig.Container).offset();
            //var node = $scope.Draw.Node(event.clientX - parentElm.left, event.clientY - parentElm.top, src.text());
            //node.task = $scope.Action.createTask($scope.Data.TaskTemplate[index].Data || {});
            //$scope.Data.Nodes.push(node);
            //$scope.Action.createPreview();
            $scope.Action.hideProperties();
            RoutingService.getRoutingByName(ui.draggable.text()).then(function (data) {
                $scope.Data.Workflow = data;
                $scope.Data.Connections = [];
                $scope.Data.Nodes = [];
                $scope.Canvas.clear();
                $scope.Draw.LoadNodes();
            });
        },
        nodeDragStart: function (x, y, elm, event) {
            var rect = elm.items[0],
                text = elm.items[1];
            rect.animate({
                stroke: '#C83F2E',
                opacity: 1
            }, 50);
            $scope.Action.createPreview();
        },
        nodeMove: function (dx, dy, x, y, elm, event) {
            $scope.Draw.repaint();
            $scope.Canvas.safari();
            elm.toFront();
        },
        nodeDragEnd: function (elm, event) {
            var rect = elm.items[0];
            rect.animate({
                stroke: RoutingConfig.nodeStyle.stroke,
                opacity: RoutingConfig.nodeStyle.opacity
            }, 200);
            $scope.Action.createPreview();
        },
        nodeClick: function (node) {
            _.each($scope.Data.Nodes, function (g) {
                if (!g)
                    return;
                if (node == g) {
                    if (g.task.Stage != $scope.Data.ActiveStage.Name) {
                        g[3].show();
                        g[4].show();
                    }
                    g[5].show();
                } else {
                    g[3].hide();
                    g[4].hide();
                    g[5].hide();
                }
            });
            $scope.Action.createPreview();
            $scope.Action.showProperties(node);
            $scope.Data.CurrentStage = node.task.Stage;
            $scope.$apply();
        },
        attachNodeEvents: function (node) {
            $scope.Canvas.safari();
            var add = node[3],
                del = node[4],
                conn = node[5],
                overrelay = node[2];

            /*node.click(function (event) {
                event.stopPropagation();
                //property grid fix
                //$(document).trigger('mousedown');
                $scope.Event.nodeClick(node);
            });*/

            add.click(function (event) {
                event.stopPropagation();
                $scope.Action.CloneNode(node);
            }).hide();

            del.click(function (event) {
                event.stopPropagation();
                $scope.Action.DeleteNode(node);
            }).hide();

            $scope.Event.attachConnector(conn, overrelay);

            node.draggable($scope.Event.nodeMove, $scope.Event.nodeDragStart, function (elm, event) {
                $scope.Event.nodeDragEnd(elm, event);
                //property grid fix
                $(document).trigger('mousedown');
                $scope.Event.nodeClick(node);
            });
            node.click(function (event) {
                event.stopPropagation();
            });

            conn.undrag();
            add.undrag();
            del.undrag();
        },
        attachConnector: function (conn, overrelay) {
            conn.mousedown(function (event) {
                event.stopPropagation();
            });

            conn.hover(function (event) {
                this.animate({
                    r: 10,
                    fill: '#C83F2E'
                }, 200);
            }, function () {
                this.animate({
                    r: 7,
                    fill: RoutingConfig.connectorStyle.fill
                }, 200);
            }).hide();

            conn.mousedown(function (e) {
                e.stopPropagation();

                var elm = $scope.Canvas.getById((e.target || e.srcElement).raphaelid),
                    x = elm.getBBox().x + 10,
                    y = elm.getBBox().y + 10,
                    line = $scope.Draw.Line(x, y, x, y);

                line.line.attr({
                    'stroke-width': 3,
                    stroke: '#C83F2E',
                    "arrow-end": "classic-wide-large"
                }).toFront();

                $(RoutingConfig.Container).data('cLine', line.line);
                $(RoutingConfig.Container).data('sElm', overrelay);

                $(RoutingConfig.Container).on('mousemove', function (e) {
                    x = e.clientX - $($scope.Canvas.canvas).offset().left;
                    y = e.clientY - $($scope.Canvas.canvas).offset().top;
                    line.updateEnd(x, y);
                });
            });
        }
    };

    $scope.Draw = {
        init: function () {
            $scope.Draw.Canvas();
            if (!($.browser.msie && $.browser.version < 9)) {
                $scope.Canvas.panzoom({
                    maxZoom: RoutingConfig.maxZoom,
                    minZoom: RoutingConfig.minZoom
                }).enable();
            }
            $scope.Draw.LoadNodes();
        },
        repaint: function () {
            var i = $scope.Data.Connections.length;

            while (i--) {
                $scope.Data.Connections[i].line.attr("arrow-end", "");
                $scope.Canvas.connection($scope.Data.Connections[i]);
                $scope.Data.Connections[i].line.attr("arrow-end", "classic-wide-large");
            }
        },
        LoadNodes: function () {
            $scope.Data.Nodes = [];
            $scope.Data.Connections = [];
            $scope.Canvas.clear();
            var drawNode = function (t) {
                node = $scope.Draw.Node(0, 0, t.TaskTemplateName);
                node.task = t;
            };

            _.each($scope.Data.Workflow.StageTemplates, function (st) {
                if (!st.IsComplete && st.Name != $scope.Data.ActiveStage.Name) {
                    _.each(st.Tasks, function (t) {
                        var node = null, _t = t;
                        if (t.GroupID == GUID_NULL && t.UrgID == GUID_NULL) {
                            var itemAttrInfo = _.filter($scope.Data.ItemInfo, function (i) {
                                if (i.IsMaster && i.IsUserGroup) {
                                    return i.ID == t.GroupTypeID;
                                }
                            });
                            if (itemAttrInfo.length) {
                                var objAttr = itemAttrInfo[0];
                                var coll = objAttr.Value.split(','),
                                    cIndex = 0,
                                    _t = t;
                                _.each(coll, function (g, ci) {
                                    var group = $scope.Util.getGroupByIntegerId(g);
                                    if (group) {
                                        _t = $.extend(true, {}, t);
                                        (cIndex > 0) && (_t.ID = uuid());
                                        _t.GroupID = group.GroupID;
                                        _t.UrgID = GUID_NULL;
                                    }
                                    drawNode(_t);
                                    cIndex++;
                                });
                            } else
                                drawNode(t);

                        } else
                            drawNode(t);
                    });
                } else {
                    st.Tasks = [];
                }
            });

            //draw connection
            var group = [];
            group = _.groupBy($scope.Data.Nodes, function (n) {
                return n.task.Stage;
            });
            var lastNode = [], index = 0;
            for (var stage in group) {
                var tasks = group[stage];
                var parents = $scope.Util.getParents(tasks);
                if (parents.length) {
                    if (lastNode.length)
                        _.each(lastNode, function (ln) {
                            _.each(parents, function (p) {
                                $scope.Draw.Connection(ln[2], p[2]);
                            });
                        });
                    _.each(parents, function (p) {
                        (function iterate(prnt, prnts) {
                            var children = $scope.Util.getChildren(tasks, prnt);
                            if (children.length) {
                                lastNode = [];
                                _.each(children, function (c) {
                                    $scope.Draw.Connection(prnt[2], c[2]);
                                    if ($.inArray(c, lastNode) < 0)
                                        lastNode.push(c);
                                    iterate(c, children);
                                });
                            }
                            else {
                                lastNode = prnts;
                            }
                        })(p, parents);
                    });
                }

                index++;
            }
            $scope.Draw.AutoAlign();
        },
        AutoAlign: function (manual) {
            if (manual) {
                $scope.Data.Workflow = $scope.Util.getWorkFlowTemplate();
                $scope.Draw.LoadNodes();
                return;
            }
            var graph = new dagre.Graph(), woffset = 100, hoffset = 40;
            _.each($scope.Data.Nodes, function (node) {
                graph.addNode('d3' + node.task.ID, { label: '', width: node.getBBox().width + woffset, height: node.getBBox().height + hoffset });
            });
            (function addEdges(t) {
                _.each(t.task.Childrens, function (c) {
                    _.each($scope.Data.Nodes, function (tt) {
                        if (tt.task.ID == c) {
                            graph.addEdge(null, 'd3' + t.task.ID, 'd3' + c);
                        }
                    });
                });

                _.each(t.task.Childrens, function (c) {
                    _.each($scope.Data.Nodes, function (tt) {
                        if (tt.task.ID == c)
                            addEdges(tt);
                    });
                });

            })($scope.Data.Nodes[0]);

            var layout = dagre.layout().run(graph);
            _.each($scope.Data.Nodes, function (n) {
                var lNode = layout._nodes['d3' + n.task.ID].value;

                n.transform("t0,0");
                var wz = $scope.Util.windowSize();

                n.translate(lNode.x + wz.width / 4, lNode.y);

                n.lx = lNode.x + wz.width / 4;
                n.ly = lNode.y;
                n.ox = lNode.x + wz.width / 4;
                n.oy = lNode.y;
                n.click();
            });

            $scope.Draw.repaint();
            $scope.Action.createPreview();
        },
        Canvas: function () {
            RoutingConfig.CanvasSize.width = $scope.Util.windowSize().width;
            RoutingConfig.CanvasSize.height = $scope.Util.windowSize().height;
            $scope.Canvas = Raphael($(RoutingConfig.Container).get(0), RoutingConfig.CanvasSize.width, RoutingConfig.CanvasSize.height);
        },
        Node: function (x, y, text) {
            var group = $scope.Canvas.set(),
                calcLen = (((text || "").length) * RoutingConfig.charWidth),
                len = calcLen > RoutingConfig.nodeMinWidth ? calcLen : RoutingConfig.nodeMinWidth,
                tx = x + (len / 2),
                ty = y + (RoutingConfig.nodeMinHeight) / 2,

                rect = $scope.Canvas.rect(x, y, len, RoutingConfig.nodeMinHeight, 5),
                tnode = $scope.Canvas.text(tx, ty, text),
                addBtn = $scope.Canvas.circle(x, y, RoutingConfig.nodeBtnRadius),
                addBtnTxt = $scope.Canvas.text(x, y, '+'),
                delBtn = $scope.Canvas.circle(x, y + RoutingConfig.nodeMinHeight, RoutingConfig.nodeBtnRadius),
                delBtnTxt = $scope.Canvas.text(x, y + RoutingConfig.nodeMinHeight, '-'),
                add = $scope.Canvas.set(addBtn, addBtnTxt),
                del = $scope.Canvas.set(delBtn, delBtnTxt),
                c1 = $scope.Canvas.circle(x + len, y + RoutingConfig.nodeMinHeight / 2, 7),
                c2 = $scope.Canvas.circle(x, y + RoutingConfig.nodeMinHeight / 2, 7),
                c3 = $scope.Canvas.circle(x + len / 2, y, 7),
                c4 = $scope.Canvas.circle(x + len / 2, y + RoutingConfig.nodeMinHeight, 7),
                connector = $scope.Canvas.set(c1, c2, c3, c4),
                overrelay = $scope.Canvas.rect(x, y, len, RoutingConfig.nodeMinHeight, 5);

            addBtn.attr(RoutingConfig.addBtnStyle);
            delBtn.attr(RoutingConfig.delBtnStyle);
            rect.attr(RoutingConfig.nodeStyle);
            tnode.attr(RoutingConfig.textStyle);
            delBtnTxt.attr(RoutingConfig.btnTxtStyle);
            addBtnTxt.attr(RoutingConfig.btnTxtStyle);
            connector.attr(RoutingConfig.connectorStyle);
            group.push(rect, tnode, overrelay, add, del, connector);
            overrelay.attr({
                fill: "white",
                opacity: 0.1,
                cursor: 'move'
            });
            $scope.Draw.initNode(group, text);
            return group;
        },
        Line: function (startX, startY, endX, endY) {
            var start = {
                x: startX,
                y: startY
            };
            var end = {
                x: endX,
                y: endY
            };
            var getPath = function () {
                return "M" + start.x + "," + start.y + "C" + start.x + "," + (start.y + 100) + "," + (end.x) + "," + (end.y - 100) + "," + end.x + "," + end.y;
            };
            var redraw = function () {
                node.attr("path", getPath());
            }

            var node = $scope.Canvas.path(getPath());
            return {
                updateStart: function (x, y) {
                    start.x = x;
                    start.y = y;
                    redraw();
                    return this;
                },
                updateEnd: function (x, y) {
                    end.x = x;
                    end.y = y;
                    redraw();
                    return this;
                },
                line: node
            };
        },
        initNode: function (node, text) {
            var add = node[3],
                del = node[4],
                conn = node[5],
                overrelay = node[2];

            node.info = {
                text: text
            };

            $scope.Event.attachNodeEvents(node);

            $scope.Data.Nodes.push(node);
        },
        Connection: function (sElm, tElm) {
            var sgrp, dgrp;
            if ($scope.Util.hasConnection(sElm, tElm))
                return;

            _.each($scope.Data.Nodes, function (e, n) {
                _.filter(e, function (s) {
                    return s == sElm
                }).length > 0 && (sgrp = e);
                _.filter(e, function (s) {
                    return s == tElm
                }).length > 0 && (dgrp = e);
            });

            var con = $scope.Canvas.connection(sElm, tElm, '#C83F2E', '#C83F2E');
            $scope.Data.Connections.push(con);

            ($.inArray(dgrp.task.ID, sgrp.task.Childrens) < 0) && sgrp.task.Childrens.push(dgrp.task.ID);
            ($.inArray(sgrp.task.ID, dgrp.task.Parents) < 0) && dgrp.task.Parents.push(sgrp.task.ID);

            sgrp.task.ChildCount = sgrp.task.Childrens.length;
            dgrp.task.ParentCount = dgrp.task.Parents.length;

            con.source = sgrp;
            con.destination = dgrp;
            con.line.click(function () {
                var sI = $.inArray(dgrp.task.ID, sgrp.task.Childrens),
                    dI = $.inArray(sgrp.task.ID, sgrp.task.Parents);

                (sI >= 0) && sgrp.task.Childrens.splice(sI, 1);
                (dI >= 0) && sgrp.task.Parents.splice(dI, 1);

                $scope.Action.removeConnectionByLine(con.line);
            });

            con.line.attr({
                "cursor": "pointer",
                "stroke-width": 3,
                "arrow-end": "classic-wide-large"
            });
        }
    };

    $scope.init = function () {
        $scope.isLoading = true;
        $scope.Data.reset();

        var pScope = window.parent.angular.element('[ng-controller="LayoutRendererCntrl"]').scope();
        RoutingService.updateHeader(pScope.Header).then(function (r) {
            if (r) {
                RoutingService.loadInitialData().then(function (res) {
                    $scope.Data.RoutingTemplate = res[0];
                    $scope.Data.UsersInGroups = res[1];
                    $scope.Data.Users = res[2];
                    $scope.Data.GroupTypes = _.filter(res[3], function (gt) { return gt.IsUserProfile == true; });
                    $scope.Data.Groups = res[4];
                    $scope.Data.Workflow = res[5];
                    $scope.Data.ItemInfo = res[6];

                    $scope.Data.ActiveStage = _.filter($scope.Data.Workflow.StageTemplates, function (st) {
                        return !st.IsComplete;
                    })[0];

                    $scope.Draw.init();
                    $scope.Action.init();
                    $scope.Event.init();
                    $scope.isLoading = false;

                    $scope.Audit = $.extend(true, {}, $scope.Data.Workflow);
                    $scope.Data.RoutingObj = $.parseJSON(window.parent.$('#RoutingObj').val()).Items;
                });
            }
        });
    };
}]);