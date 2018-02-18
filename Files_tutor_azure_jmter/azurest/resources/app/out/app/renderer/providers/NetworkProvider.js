"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var tslib_1 = require("tslib");
var Q = require("q");
var dns = require("dns");
var URL = require("url");
var NetworkProvider = (function () {
    function NetworkProvider() {
    }
    NetworkProvider.isConnected = function (url) {
        return NetworkProvider._isConnected(URL.parse(url).host, 10, .5);
    };
    NetworkProvider._isConnected = function (hostname, attempts, delayInSeconds) {
        if (delayInSeconds === void 0) { delayInSeconds = 1; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (attempts === 0) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, Q.Promise(function (resolve, reject) {
                        setTimeout(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var canResolveHost, _a;
                            return tslib_1.__generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, NetworkProvider._canResolveHost(hostname)];
                                    case 1:
                                        canResolveHost = _b.sent();
                                        if (!canResolveHost) return [3 /*break*/, 2];
                                        resolve(true);
                                        return [3 /*break*/, 4];
                                    case 2:
                                        _a = resolve;
                                        return [4 /*yield*/, NetworkProvider._isConnected(hostname, attempts - 1)];
                                    case 3:
                                        _a.apply(void 0, [_b.sent()]);
                                        _b.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }, delayInSeconds * 1000);
                    })];
            });
        });
    };
    NetworkProvider._canResolveHost = function (hostname) {
        return Q.Promise(function (resolve, reject) {
            dns.lookup(hostname, function (err, address, family) {
                if (!!err) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    return NetworkProvider;
}());
module.exports = {
    "Environment.Network.isConnected": function (args) {
        return NetworkProvider.isConnected(args.url);
    }
};
