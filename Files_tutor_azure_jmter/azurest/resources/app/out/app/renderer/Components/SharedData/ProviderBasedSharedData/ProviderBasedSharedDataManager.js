"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var SharedDataManager_1 = require("../SharedDataManager");
var ProviderBasedSharedDataManager = (function () {
    function ProviderBasedSharedDataManager(host) {
        this._sharedDataManager = new SharedDataManager_1.default();
        this._host = host;
    }
    ProviderBasedSharedDataManager.prototype.createSharedData = function (data) {
        return this._sharedDataManager.createSharedData(data);
    };
    ProviderBasedSharedDataManager.prototype.readSharedData = function (dataRef) {
        return this._sharedDataManager.readSharedData(dataRef);
    };
    ProviderBasedSharedDataManager.prototype.getSharedDataLease = function (dataRef) {
        return this._sharedDataManager.getSharedDataLease(dataRef);
    };
    ProviderBasedSharedDataManager.prototype.renewSharedDataLease = function (lease) {
        return this._sharedDataManager.renewSharedDataLease(lease);
    };
    ProviderBasedSharedDataManager.prototype.endSharedDataLease = function (lease) {
        return this._sharedDataManager.endSharedDataLease(lease);
    };
    ProviderBasedSharedDataManager.prototype.updateSharedData = function (lease, data) {
        return this._sharedDataManager.updateSharedData(lease, data);
    };
    ProviderBasedSharedDataManager.prototype.deleteSharedData = function (lease) {
        return this._sharedDataManager.deleteSharedData(lease);
    };
    return ProviderBasedSharedDataManager;
}());
exports.default = ProviderBasedSharedDataManager;
