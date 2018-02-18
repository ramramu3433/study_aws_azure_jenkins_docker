"use strict";
var ProviderBasedSharedDataManager_1 = require("../Components/SharedData/ProviderBasedSharedData/ProviderBasedSharedDataManager");
var host = global.host;
var sharedDataManager = new ProviderBasedSharedDataManager_1.default(host);
var SharedDataProvider = {
    "SharedDataManager.createSharedData": function (data) { return sharedDataManager.createSharedData(data); },
    "SharedDataManager.readSharedData": function (dataRef) { return sharedDataManager.readSharedData(dataRef); },
    "SharedDataManager.getSharedDataLease": function (dataRef) { return sharedDataManager.getSharedDataLease(dataRef); },
    "SharedDataManager.renewSharedDataLease": function (lease) { return sharedDataManager.renewSharedDataLease(lease); },
    "SharedDataManager.endSharedDataLease": function (lease) { return sharedDataManager.endSharedDataLease(lease); },
    "SharedDataManager.updateSharedData": function (args) { return sharedDataManager.updateSharedData(args.lease, args.data); },
    "SharedDataManager.deleteSharedData": function (lease) { return sharedDataManager.deleteSharedData(lease); }
};
module.exports = SharedDataProvider;
