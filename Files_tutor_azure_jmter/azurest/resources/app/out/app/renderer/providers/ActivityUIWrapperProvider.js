"use strict";
var ActivityLogMarshalerFactory = require("../marshalers/ActivityLogMarshalerFactory");
var ActivityManager_1 = require("../Components/Activities/ActivityManager");
var Q = require("q");
var ActivityChangeType;
(function (ActivityChangeType) {
    ActivityChangeType[ActivityChangeType["Add"] = 0] = "Add";
    ActivityChangeType[ActivityChangeType["Update"] = 1] = "Update";
    ActivityChangeType[ActivityChangeType["Delete"] = 2] = "Delete";
})(ActivityChangeType || (ActivityChangeType = {}));
var host = global.host;
var activityManagerProxy = new ActivityManager_1.Remote(host);
function convertActivity(activity, activityRef, children) {
    var uiActivityModel = {
        _id: JSON.stringify(activityRef),
        _title: activity.title,
        _childSortOrder: activity.sortOrder,
        _status: activity.status,
        _progress: activity.progress,
        _message: activity.message,
        _actionNames: {},
        _children: [],
        _parent: activity.parent
    };
    if (activity.actions) {
        activity.actions.forEach(function (action) {
            uiActivityModel._actionNames[action.title] = true;
        });
    }
    return uiActivityModel;
}
var activityRefActionQueueMap = {};
function handleChange(activityRef, changeType) {
    if (changeType === ActivityChangeType.Delete) {
        activityRefActionQueueMap[activityRef.id] = ActivityChangeType.Delete;
    }
    else {
        if (activityRefActionQueueMap[activityRef.id] !== ActivityChangeType.Delete && activityRefActionQueueMap[activityRef.id] !== ActivityChangeType.Add) {
            activityRefActionQueueMap[activityRef.id] = changeType;
        }
    }
    if (!processingChanges) {
        processChanges();
    }
}
function processChange(activityRef, changeToProcess) {
    var changePromise;
    switch (changeToProcess) {
        case ActivityChangeType.Add:
            changePromise = onAdd(activityRef);
            break;
        case ActivityChangeType.Update:
            changePromise = onUpdate(activityRef);
            break;
        case ActivityChangeType.Delete:
            changePromise = onDelete(activityRef);
            break;
    }
}
var processingChanges = false;
function processChanges() {
    processingChanges = true;
    var changesToProcess = activityRefActionQueueMap;
    activityRefActionQueueMap = {};
    var activityIds = Object.keys(changesToProcess);
    activityIds.forEach(function (activityId) {
        processChange({ id: activityId }, changesToProcess[activityId]);
    });
    setTimeout(function () { return processChanges(); }, 3000);
}
function getUIActivityFromIActivityRef(activityRef) {
    return activityManagerProxy.get(activityRef).then(function (activity) {
        if (!activity) {
            return;
        }
        var uiActivityModel = convertActivity(activity, activityRef);
        if (activity.numChildren > 0) {
            return updateActivityWithChildren(uiActivityModel, activityRef);
        }
        else {
            return uiActivityModel;
        }
    });
}
function updateActivityWithChildren(activity, activityRef) {
    return activityManagerProxy.getChildren(activityRef).then(function (children) {
        var chidrenPromises = [];
        children.forEach(function (child) {
            var uiActivity = convertActivity(child.activity, child.activityRef);
            activity._children.push(uiActivity);
            if (child.activity.numChildren > 0) {
                chidrenPromises.push(updateActivityWithChildren(uiActivity, child.activityRef));
            }
            else {
                chidrenPromises.push(uiActivity);
            }
        });
        return Q.all(chidrenPromises).then(function () {
            return activity;
        });
    });
}
function onAdd(activityRef) {
    return getUIActivityFromIActivityRef(activityRef).then(function (uiActivityModel) {
        if (!uiActivityModel) {
            return;
        }
        return ActivityLogMarshalerFactory.addEntry(uiActivityModel);
    });
}
function onUpdate(activityRef) {
    return getUIActivityFromIActivityRef(activityRef).then(function (uiActivityModel) {
        if (!uiActivityModel) {
            return;
        }
        return ActivityLogMarshalerFactory.updateEntry(uiActivityModel);
    });
}
function onDelete(activityRef) {
    ActivityLogMarshalerFactory.deleteEntry({ _id: JSON.stringify(activityRef) });
    return Q.resolve(null);
}
var ActivityUIWrapperProvider = {
    "ActivityManager.onAddEvent": function (args) {
        if (!!args.parentRef) {
            handleChange(args.parentRef, ActivityChangeType.Update);
        }
        else {
            handleChange(args.entryRef, ActivityChangeType.Add);
        }
    },
    "ActivityManager.onUpdateEvent": function (args) {
        if (!!args.parentRef) {
            handleChange(args.parentRef, ActivityChangeType.Update);
        }
        else {
            handleChange(args.entryRef, ActivityChangeType.Update);
        }
    },
    "ActivityManager.onDeleteEvent": function (args) {
        if (!!args.parentRef) {
            handleChange(args.parentRef, ActivityChangeType.Update);
        }
        else {
            handleChange(args.entryRef, ActivityChangeType.Delete);
        }
    }
};
ActivityLogMarshalerFactory.onExecuteAction(function (id, actionName) {
    activityManagerProxy.executeAction(JSON.parse(id), { title: actionName });
});
module.exports = ActivityUIWrapperProvider;
