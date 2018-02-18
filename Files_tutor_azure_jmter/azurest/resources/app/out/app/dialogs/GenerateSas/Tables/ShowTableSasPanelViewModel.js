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
var ShowTableSasViewModel = (function (_super) {
    tslib_1.__extends(ShowTableSasViewModel, _super);
    function ShowTableSasViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        /* Labels */
        _this.tableLabel = "Table:"; // Localize
        _this.tableName = parameters.tableName;
        _this.itemType = _this.tableLabel;
        _this.itemName = _this.tableName;
        return _this;
    }
    ShowTableSasViewModel.prototype.executeGenerateSasOperation = function (parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var operation, operationParameters;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        operation = parameters.accessPolicyId ?
                            "Azure.Storage.Table.generateSharedAccessSignatureWithPolicy" :
                            "Azure.Storage.Table.generateSharedAccessSignature";
                        if (!!parameters.accessPolicyId) {
                            operationParameters = {
                                connectionString: this.connectionString,
                                tableName: this.tableName,
                                accessPolicyId: parameters.accessPolicyId
                            };
                        }
                        else {
                            operationParameters = {
                                connectionString: this.connectionString,
                                tableName: this.tableName,
                                expiry: parameters.expiry,
                                start: parameters.start,
                                permissions: parameters.permissions,
                                startPartitionKey: parameters.startPartitionKey,
                                endPartitionKey: parameters.endPartitionKey,
                                startRowKey: parameters.startRowKey,
                                endRowKey: parameters.endRowKey
                            };
                        }
                        return [4 /*yield*/, DialogOperationRouterProxy_1.default.executeOperation(operation, operationParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ShowTableSasViewModel;
}(ShowSasPanelViewModel_1.default));
exports.default = ShowTableSasViewModel;
