"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var RemoteSharedDataManager = (function () {
    function RemoteSharedDataManager(host) {
        this._host = host;
    }
    RemoteSharedDataManager.prototype.createSharedData = function (data) {
        return this._host.executeOperation("SharedDataManager.createSharedData", data);
    };
    RemoteSharedDataManager.prototype.readSharedData = function (dataRef) {
        return this._host.executeOperation("SharedDataManager.readSharedData", dataRef);
    };
    RemoteSharedDataManager.prototype.getSharedDataLease = function (dataRef) {
        return this._host.executeOperation("SharedDataManager.getSharedDataLease", dataRef);
    };
    RemoteSharedDataManager.prototype.renewSharedDataLease = function (lease) {
        return this._host.executeOperation("SharedDataManager.renewSharedDataLease", lease);
    };
    RemoteSharedDataManager.prototype.endSharedDataLease = function (lease) {
        return this._host.executeOperation("SharedDataManager.endSharedDataLease", lease);
    };
    RemoteSharedDataManager.prototype.updateSharedData = function (lease, data) {
        return this._host.executeOperation("SharedDataManager.updateSharedData", { lease: lease, data: data });
    };
    RemoteSharedDataManager.prototype.deleteSharedData = function (lease) {
        return this._host.executeOperation("SharedDataManager.deleteSharedData", lease);
    };
    return RemoteSharedDataManager;
}());
exports.default = RemoteSharedDataManager;
