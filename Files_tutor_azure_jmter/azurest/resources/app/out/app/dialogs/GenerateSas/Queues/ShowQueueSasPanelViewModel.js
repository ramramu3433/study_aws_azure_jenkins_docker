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
var ShowQueueSasViewModel = (function (_super) {
    tslib_1.__extends(ShowQueueSasViewModel, _super);
    function ShowQueueSasViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        /* Labels */
        _this.containerLabel = "Queue:"; // Localize
        _this.queueName = parameters.queueName;
        _this.itemType = _this.containerLabel;
        _this.itemName = _this.queueName;
        return _this;
    }
    ShowQueueSasViewModel.prototype.executeGenerateSasOperation = function (parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var operation, operationParameters;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        operation = parameters.accessPolicyId ?
                            "Azure.Storage.Queue.generateSharedAccessSignatureWithPolicy" :
                            "Azure.Storage.Queue.generateSharedAccessSignature";
                        if (!!parameters.accessPolicyId) {
                            operationParameters = {
                                connectionString: this.connectionString,
                                queueName: this.queueName,
                                accessPolicyId: parameters.accessPolicyId
                            };
                        }
                        else {
                            operationParameters = {
                                connectionString: this.connectionString,
                                queueName: this.queueName,
                                expiry: parameters.expiry,
                                start: parameters.start,
                                permissions: parameters.permissions
                            };
                        }
                        return [4 /*yield*/, DialogOperationRouterProxy_1.default.executeOperation(operation, operationParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ShowQueueSasViewModel;
}(ShowSasPanelViewModel_1.default));
exports.default = ShowQueueSasViewModel;
