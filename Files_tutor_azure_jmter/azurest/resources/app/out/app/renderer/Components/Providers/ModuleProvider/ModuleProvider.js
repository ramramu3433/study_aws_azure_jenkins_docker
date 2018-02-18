"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var path = require("path");
var ModuleProvider = (function () {
    function ModuleProvider(providerNamespace, nodeJSRequirePath) {
        var _this = this;
        this.getFunction = function (functionNamespace) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._init()];
                    case 1:
                        _a.sent();
                        this.getFunction = this._getFunction;
                        return [2 /*return*/, this.getFunction(functionNamespace)];
                }
            });
        }); };
        this._getFunction = function (functionNamespace) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var functionHandler;
            return tslib_1.__generator(this, function (_a) {
                functionHandler = this._module[functionNamespace];
                if (!functionHandler) {
                    throw "Unable to execute " + functionNamespace + " as the function namespace is not implemented by the provider with namespace " + this.namespace;
                }
                return [2 /*return*/, functionHandler];
            });
        }); };
        this.namespace = providerNamespace;
        this._nodeJSRequirePath = nodeJSRequirePath;
    }
    ModuleProvider.prototype._init = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (!this._module) {
                    this._module = require(path.resolve(ModuleProvider._baseRequirePath, this._nodeJSRequirePath));
                }
                return [2 /*return*/];
            });
        });
    };
    return ModuleProvider;
}());
ModuleProvider._baseRequirePath = path.resolve(__dirname, "../../../marshalers");
exports.default = ModuleProvider;
