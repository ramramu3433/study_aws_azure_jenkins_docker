"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var SharedDataLeaseAutoRenewer = (function () {
    function SharedDataLeaseAutoRenewer(sharedDataManger, lease, errorHandler) {
        var _this = this;
        this._renew = true;
        this._renewLease = function () {
            if (_this._renew) {
                _this._currentRenewPromise = _this._sharedDataManger.renewSharedDataLease(_this._lease)
                    .then(function (lease) {
                    _this._lease.expiration = lease.expiration;
                    setTimeout(_this._renewLease, (lease.expiration - Date.now()) / 2);
                }).catch(function (err) {
                    if (!!_this._errorHandler) {
                        _this._errorHandler(err);
                    }
                });
            }
        };
        this.stopRenew = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._renew = false;
                        if (!!!this._currentRenewPromise) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._currentRenewPromise];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        this._sharedDataManger = sharedDataManger;
        this._lease = lease;
        this._renewLease();
        this._errorHandler = errorHandler;
    }
    return SharedDataLeaseAutoRenewer;
}());
exports.default = SharedDataLeaseAutoRenewer;
