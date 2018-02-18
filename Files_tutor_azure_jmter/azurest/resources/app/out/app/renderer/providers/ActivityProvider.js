"use strict";
var ProviderBasedActivityManager_1 = require("../Components/Activities/ProviderBasedActivities/ProviderBasedActivityManager");
var host = global.host;
var activityManager = new ProviderBasedActivityManager_1.default(host);
var ActivityProvider = {
    "ActivityManager.add": function (args) { return activityManager.add(args); },
    "ActivityManager.update": function (args) { return activityManager.update(args.activityRef, args.updatedActivity); },
    "ActivityManager.delete": function (args) { return activityManager.delete(args); },
    "ActivityManager.get": function (args) { return activityManager.get(args); },
    "ActivityManager.getChildren": function (args) { return activityManager.getChildren(args); },
    "ActivityManager.executeAction": function (args) { return activityManager.executeAction(args.activityRef, args.action); }
};
module.exports = ActivityProvider;
