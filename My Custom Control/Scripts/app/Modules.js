var MODULES = ["glams.components.ui"];

window.glams = {};

window.glams.Actions = {
    Add: function (name, callback) {
        window.glams.GridActions[name] = callback;
    }
};

window.glams.GridActions = {};