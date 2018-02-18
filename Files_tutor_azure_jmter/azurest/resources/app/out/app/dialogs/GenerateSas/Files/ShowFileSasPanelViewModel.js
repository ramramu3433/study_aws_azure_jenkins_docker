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
var ShowFileSasViewModel = (function (_super) {
    tslib_1.__extends(ShowFileSasViewModel, _super);
    function ShowFileSasViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        _this.fileLabel = "File:"; // Localize
        _this.directoryLabel = "Directory:"; // Localize
        _this.shareLabel = "Share:"; // Localize
        _this.shareName = parameters.shareName;
        _this.fileName = parameters.fileName;
        if (_this.fileName) {
            _this.itemType = _this.fileLabel;
            _this.itemName = _this.fileName;
        }
        else {
            _this.itemType = _this.shareLabel;
            _this.itemName = _this.shareName;
        }
        return _this;
    }
    ShowFileSasViewModel.prototype.executeGenerateSasOperation = function (parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var operation, operationParameters;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        operation = parameters.accessPolicyId ?
                            "Azure.Storage.File.generateSharedAccessSignatureWithPolicy" :
                            "Azure.Storage.File.generateSharedAccessSignature";
                        if (!!parameters.accessPolicyId) {
                            operationParameters = {
                                connectionString: this.connectionString,
                                shareName: this.shareName,
                                accessPolicyId: parameters.accessPolicyId,
                                fileName: this.fileName
                            };
                        }
                        else {
                            operationParameters = {
                                connectionString: this.connectionString,
                                shareName: this.shareName,
                                expiry: parameters.expiry,
                                fileName: this.fileName,
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
    return ShowFileSasViewModel;
}(ShowSasPanelViewModel_1.default));
exports.default = ShowFileSasViewModel;
