"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var url = require("url");
var Utilities = require("../SasUtilities");
var DialogOperationRouterProxy_1 = require("../../Common/DialogOperationRouterProxy");
var ShowSasPanelViewModel_1 = require("../ShowSasPanelViewModel");
/**
 * View model for Show Shared Access Signature dialog
 */
var ShowBlobSasPanelViewModel = (function (_super) {
    tslib_1.__extends(ShowBlobSasPanelViewModel, _super);
    function ShowBlobSasPanelViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        /* Labels */
        _this.blobLabel = "Blob:"; // Localize
        _this.containerLabel = "Container:"; // Localize
        _this.containerName = parameters.containerName;
        _this.blobName = parameters.blobName;
        if (_this.blobName) {
            _this.itemType = _this.blobLabel;
            _this.itemName = _this.blobName;
        }
        else {
            _this.itemType = _this.containerLabel;
            _this.itemName = _this.containerName;
        }
        return _this;
    }
    ShowBlobSasPanelViewModel.prototype.executeGenerateSasOperation = function (parameters) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var operation, operationParameters;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        operation = parameters.accessPolicyId ?
                            "Azure.Storage.Blob.generateSharedAccessSignatureWithPolicy" :
                            "Azure.Storage.Blob.generateSharedAccessSignature";
                        operationParameters = {
                            connectionString: this.connectionString,
                            containerName: this.containerName
                        };
                        if (parameters.accessPolicyId) {
                            operationParameters.accessPolicyId = parameters.accessPolicyId;
                            if (!parameters.blobAsContainerSas) {
                                operationParameters.blobName = this.blobName;
                            }
                        }
                        else {
                            operationParameters.expiry = parameters.expiry;
                            operationParameters.blobName = parameters.blobAsContainerSas ? "" : this.blobName;
                            operationParameters.start = parameters.start;
                            operationParameters.permissions = parameters.permissions;
                        }
                        return [4 /*yield*/, DialogOperationRouterProxy_1.default.executeOperation(operation, operationParameters)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets the blob or blob container SAS URL and token from a SAS generation result.
     *
     * Single blobs can be accessed via blob or container URLS.
     * It's possible that a container-level SAS result may have been meant for only a single blob.
     * In this case, the original container URL is modified to point to the blob.
     *
     * @override
     */
    ShowBlobSasPanelViewModel.prototype.getSasDataFromResult = function (result) {
        var sasUrl = url.parse(result.sasUrl, true);
        if (!!this.blobName && sasUrl.query.sr === "c") {
            // The user wanted a container-level SAS URL for a single blob if the blob name is specified.
            // Append the blob name to the container URL's path.
            sasUrl.pathname = Utilities.JoinAzurePaths(sasUrl.pathname, this.blobName);
        }
        return {
            sasUrl: sasUrl.href,
            sasToken: result.sasToken
        };
    };
    return ShowBlobSasPanelViewModel;
}(ShowSasPanelViewModel_1.default));
exports.default = ShowBlobSasPanelViewModel;
