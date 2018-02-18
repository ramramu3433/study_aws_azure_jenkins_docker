"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Q = require("q");
var ExceptionSerialization_1 = require("../Errors/ExceptionSerialization");
var ModuleProvider_1 = require("./ModuleProvider/ModuleProvider");
var SeparateProcessProviderProxy_1 = require("./ProcessProvider/SeparateProcessProviderProxy");
var ModuleProviderFactory = (function () {
    function ModuleProviderFactory() {
        var _this = this;
        this.registeredProviders = Object.create(null);
        this._functionToProviderCache = Object.create(null);
        this.registerProvider = function (providerNamespace, nodeJSRequirePath, seperateProcess, debugPort) {
            try {
                var provider;
                if (seperateProcess) {
                    provider = new SeparateProcessProviderProxy_1.default(providerNamespace, nodeJSRequirePath, debugPort);
                }
                else {
                    provider = new ModuleProvider_1.default(providerNamespace, nodeJSRequirePath);
                }
                _this.registeredProviders[providerNamespace] = provider;
                return Promise.resolve({ type: "result", result: null });
            }
            catch (e) {
                // Write the error to console (e.g. unable to load file)
                // TODO: Use logging library instead of writing to console
                console.error(e);
                return Promise.resolve({ type: "error", error: ExceptionSerialization_1.default.serialize(e) });
            }
        };
        this.executeFunction = function (providerNamespace, functionNamespace, args) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var provider, functionHandler, functionResult, promiseResult, error;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.registeredProviders[providerNamespace];
                        this._functionToProviderCache[functionNamespace] = providerNamespace;
                        if (!provider) {
                            throw "Unable to execute " + functionNamespace + " as no provider with namespace " + providerNamespace + " was registered";
                        }
                        return [4 /*yield*/, provider.getFunction(functionNamespace)];
                    case 1:
                        functionHandler = _a.sent();
                        if (functionHandler) {
                            try {
                                functionResult = functionHandler(args);
                            }
                            catch (err) {
                                error = err;
                            }
                            if (error) {
                                promiseResult = Q.reject(error);
                            }
                            else if (Q.isPromiseAlike(functionResult)) {
                                promiseResult = functionResult;
                            }
                            else {
                                promiseResult = Q.resolve(functionResult);
                            }
                            return [2 /*return*/, promiseResult];
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.executeLocalFunction = function (functionNamespace, args) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var providerNamespace;
            return tslib_1.__generator(this, function (_a) {
                providerNamespace = this._functionToProviderCache[functionNamespace];
                if (!providerNamespace) {
                    throw "No provider for " + functionNamespace + "is cached.";
                }
                else {
                    return [2 /*return*/, this.executeFunction(providerNamespace, functionNamespace, args)];
                }
                return [2 /*return*/];
            });
        }); };
    }
    ModuleProviderFactory.prototype.functionIsLocal = function (functionNamespace) {
        return !!this._functionToProviderCache[functionNamespace];
    };
    return ModuleProviderFactory;
}());
exports.default = ModuleProviderFactory;
