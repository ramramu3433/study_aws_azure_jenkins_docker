"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ProcessManager_1 = require("../../ProcessManager/Host/ProcessManager");
var MessagePassingProviderProxy_1 = require("../MessagePassingProvider/MessagePassingProviderProxy");
var Q = require("q");
var SeparateProcessProviderProxy = (function () {
    function SeparateProcessProviderProxy(providerNamespace, nodeJSRequirePath, debugPort) {
        var _this = this;
        this._host = global.host;
        this._init = function () {
            if (!_this._messagePassingProviderProxy && !_this._initPromise) {
                _this._initPromise = _this._host.executeOperation("SslCertificateManager.getCertsDir", {})
                    .then(function (directory) {
                    return ProcessManager_1.default.startProcess(__dirname + "/ProviderBootloader", "init", [_this.namespace, _this._nodeJSRequirePath], _this._debugPort, directory).then(function (childProcess) {
                        _this._childProcess = childProcess;
                        _this._childProcess.onDisconnected(_this._handleDisconnected);
                        _this._messagePassingProviderProxy = new MessagePassingProviderProxy_1.default(_this.namespace, _this._childProcess, _this._childProcess, _this._host);
                        _this._initPromise = null;
                    });
                });
            }
            return _this._initPromise ? _this._initPromise : Q.resolve(null);
        };
        this.getFunction = function (functionNamespace) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._messagePassingProviderProxy.getFunction(functionNamespace)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
        this._handleDisconnected = function (error) {
            var messagePassingProviderProxy = _this._messagePassingProviderProxy;
            if (messagePassingProviderProxy) {
                _this._messagePassingProviderProxy = null;
                messagePassingProviderProxy.rejectAllPending(error);
            }
        };
        this.namespace = providerNamespace;
        this._nodeJSRequirePath = nodeJSRequirePath;
        this._debugPort = debugPort;
    }
    return SeparateProcessProviderProxy;
}());
exports.default = SeparateProcessProviderProxy;
