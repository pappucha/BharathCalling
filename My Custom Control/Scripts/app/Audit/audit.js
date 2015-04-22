(function ($, angular, window, document, undefined) {
    var objectDiff = typeof exports != 'undefined' ? exports : {};
    /**
     * @param {Object} a
     * @param {Object} b
     * @return {Object}
     */
    objectDiff.diffOwnProperties = function diffOwnProperties(a, b) {

        if (a === b) {
            return {
                changed: 'equal',
                value: a
            }
        }

        var diff = {};
        var equal = true;
        var keys = Object.keys(a);

        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            if (b.hasOwnProperty(key)) {
                if (a[key] === b[key]) {
                    /*diff[key] = {
                        changed: 'equal',
                        value: a[key]
                    }*/
                } else {
                    var typeA = typeof a[key];
                    var typeB = typeof b[key];
                    if (a[key] && b[key] && (typeA == 'object' || typeA == 'function') && (typeB == 'object' || typeB == 'function')) {
                        var valueDiff = diffOwnProperties(a[key], b[key]);

                        // fix for form deisgner to get parent property name
                        if (valueDiff.changed && valueDiff.changed == 'object change') {
                            for (var k in valueDiff.value) {
                                if (valueDiff.value[k].property)
                                {
                                    valueDiff.value[k].property = ((a[key] instanceof Array) ? (a.AuditName + ' -> ' + key) : a[key].AuditName + ' -> ' + k);
                                }
                            }
                        }

                        if (valueDiff.changed == 'equal') {
                            /*diff[key] = {
                                changed: 'equal',
                                value: a[key]
                            }*/
                        } else {
                            equal = false;
                            diff[key] = valueDiff;
                        }
                    } else {
                        equal = false;
                        diff[key] = {
                            changed: 'primitive change',
                            property: b['AuditName'] + ' -> ' + key,
                            removed: a[key],
                            added: b[key],
                        }
                    }
                }
            } else {
                equal = false;
                diff[key] = {
                    changed: 'removed',
                    property: a['AuditName'] + ' -> ' + key,
                    value: a[key],
                    obj: a
                }
            }
        }

        keys = Object.keys(b);

        for (i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (!a.hasOwnProperty(key)) {
                equal = false;
                diff[key] = {
                    changed: 'added',
                    property: b['AuditName'] + ' -> ' + key,
                    value: b[key]
                }
            }
        }

        if (equal) {
            return {
                value: a,
                changed: 'equal'
            }
        } else {
            return {
                changed: 'object change',
                value: diff
            }
        }
    };

    objectDiff.GetObjectChanges = function (a, b) {
        var flat = [];
        var res = objectDiff.diffOwnProperties(a, b);
        
        (function iterate(r) {
            for (k in r) {
                if (typeof r[k] == 'object')
                    iterate(r[k]);
                else {
                    (k == 'changed' && r[k] != 'object change') && flat.push(r);
                }
            }
        })(res);

        return flat;
    };

    angular.module('glams.audit', [])

    .factory('Audit', function ($http, $q) {
        var _serviceUrl = path + 'api/Form/ConfigurationAudit',
            _auditObj = {
                Action: 'Update',
                Type: '',
                Log: []
            },

            _messageObj = {
                Property: '',
                OldValue: '',
                NewValue: '',
                log: '',
                Href: ''
            },
            AuditService = {
                Type: {
                    WORKFLOW: 'Workflow',
                    EMAIL: 'Email',
                    TASK: 'Task',
                    LAYOUT: 'Layout',
                    ROUTING: 'Routing',
                    RULES: 'Rules',
                    USER: 'UserConfiguration'
                }
            };

        AuditService.log = function (auditType, oldObject, newObject, auditDataHandler) {
            var dObj = $q.defer();
            
            if (!oldObject || !newObject) {
                setTimeout(function () {
                    dObj.resolve();
                }, 0);
                return dObj.promise;
            }

            var dataHandler = auditDataHandler || (new Function("obj", "return obj"));
            var tempSourceObject = dataHandler(oldObject);
            var tempDestObject = dataHandler(newObject);

            var diff = objectDiff.GetObjectChanges(tempSourceObject, tempDestObject);
            var audit = $.extend(true, {}, _auditObj);
            audit.Type = auditType;

            $.each(diff, function (i, a) {
                if (a.changed == 'equal')
                    return true;

                var msg = $.extend(true, {}, _messageObj);                
                msg.Property = a.property || '';

                if (msg.Property.indexOf('AuditName') < 0) {
                    msg.log = a.changed;
                    switch (a.changed) {
                        case "primitive change":
                            msg.OldValue = a.removed;
                            msg.NewValue = a.added;
                            break;
                        case "removed":
                        case "added":
                            msg.OldValue = '';
                            msg.NewValue = (a.value && a.value.AuditName) || "";
                            break;
                    }
                    audit.Log.push(msg);
                }
            });
            
            if (audit.Log.length)
                return AuditService.save(audit);
            else {
                setTimeout(function () {
                    dObj.resolve();
                }, 0);
                return dObj.promise;
            }
        };

        AuditService.save = function (auditObj) {
            var dObj = $q.defer();
            $http.post(_serviceUrl, auditObj, { 'headers': { 'RequestVerificationToken': $('[name="__RequestVerificationToken"]').val() || "" } }).success(function (data) {
                dObj.resolve(data);
            }).error(function (err) {
                dObj.reject(err);
            });
            return dObj.promise;
        };

        return {
            log: AuditService.log,
            Type: AuditService.Type
        };
    })

})(jQuery, angular, window, document);
