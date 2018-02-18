"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SharedDataLeaseAutoRenewer_1 = require("../../Components/SharedData/SharedDataLeaseAutoRenewer");
var ISharedDataProcessor = (function () {
    function ISharedDataProcessor(sharedDataManager, sharedDataRef, readOnly) {
        if (readOnly === void 0) { readOnly = false; }
        var _this = this;
        this._sharedDataManager = sharedDataManager;
        if (readOnly) {
            this._initPromise = this._sharedDataManager.readSharedData(sharedDataRef)
                .then(function (data) {
                _this._data = data;
            });
        }
        else {
            this._initPromise = this._sharedDataManager.getSharedDataLease(sharedDataRef)
                .then(function (lease) {
                _this._sharedDataLease = lease;
                _this._data = _this._sharedDataLease.data;
                _this._renewer = new SharedDataLeaseAutoRenewer_1.default(sharedDataManager, lease);
            });
        }
    }
    ISharedDataProcessor.prototype.commit = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!!!this._sharedDataLease) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._renewer.stopRenew()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._sharedDataManager.updateSharedData(this._sharedDataLease)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3: throw "No lease available to commit.";
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        console.warn(err_1);
                        return [3 /*break*/, 6];
                    case 6:
                        this._sharedDataLease = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    ISharedDataProcessor.prototype.isReady = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._initPromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ISharedDataProcessor.prototype.setField = function (field, value) {
        this._data[field] = value;
    };
    ISharedDataProcessor.prototype.getField = function (field) {
        return this._data[field];
    };
    return ISharedDataProcessor;
}());
exports.default = ISharedDataProcessor;
