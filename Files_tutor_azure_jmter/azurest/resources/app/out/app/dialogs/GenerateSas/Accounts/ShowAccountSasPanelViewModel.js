"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var DialogOperationRouterProxy_1 = require("../../Common/DialogOperationRouterProxy");
var ShowSasPanelViewModel_1 = require("../ShowSasPanelViewModel");
/**
 * View model for Show Shared Access Signature dialog
 */
var ShowAccountSasViewModel = (function (_super) {
    tslib_1.__extends(ShowAccountSasViewModel, _super);
    function ShowAccountSasViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        /* Labels */
        _this.accountLabel = "Account Name:"; // Localize
        _this.connectionLabel = "Connection String:"; // Localize
        _this.accountName = parameters.accountName;
        _this.itemType = _this.accountLabel;
        _this.itemName = _this.accountName;
        return _this;
    }
    ShowAccountSasViewModel.prototype.executeGenerateSasOperation = function (parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var operation, operationParameters;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        operation = "Azure.Storage.Account.generateSharedAccessSignature";
                        operationParameters = {
                            connectionString: this.connectionString,
                            services: parameters.services,
                            resourceTypes: parameters.resourceTypes,
                            permissions: parameters.permissions,
                            expiry: parameters.expiry,
                            start: parameters.start
                        };
                        return [4 /*yield*/, DialogOperationRouterProxy_1.default.executeOperation(operation, operationParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ShowAccountSasViewModel.prototype.getSasDataFromResult = function (result) {
        return {
            sasToken: result.sasToken,
            connectionString: result.connectionString
        };
    };
    return ShowAccountSasViewModel;
}(ShowSasPanelViewModel_1.default));
exports.default = ShowAccountSasViewModel;
