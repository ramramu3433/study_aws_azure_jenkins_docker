"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ko = require("knockout");
var GenerateSasPanelViewModel_1 = require("../GenerateSasPanelViewModel");
var SwitchValueViewModel_1 = require("../../Common/SwitchValueViewModel");
/**
 * View model for Generate Shared Access Signature dialog
 */
var GenerateBlobSasPanelViewModel = (function (_super) {
    tslib_1.__extends(GenerateBlobSasPanelViewModel, _super);
    function GenerateBlobSasPanelViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        // Localize
        _this.readLabel = "Read"; // localize
        _this.writeLabel = "Write"; // localize
        _this.deleteLabel = "Delete"; // localize
        _this.listLabel = "List"; // localize
        _this.containerLevelSasWarning = "Using a container-level shared access signature URI will give access to all blobs in the container.";
        _this.generateContainerLevelSasLabel = "Generate container-level shared access signature URI"; // Localize
        _this.containerName = parameters.containerName;
        _this.isSasForBlob = !!parameters.blobName;
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", _this.readLabel),
            new SwitchValueViewModel_1.default("w", _this.writeLabel),
            new SwitchValueViewModel_1.default("d", _this.deleteLabel),
            new SwitchValueViewModel_1.default("l", _this.listLabel)
        ]);
        _this.generateContainerLevelSas = ko.observable(!!parameters.blobAsContainerSas);
        _this.generateContainerLevelSasMessage = ko.pureComputed(function () { return _this.generateContainerLevelSas() ?
            _this.containerLevelSasWarning : ""; });
        _this.initialize();
        return _this;
    }
    GenerateBlobSasPanelViewModel.prototype.getAclOperation = function () {
        return "Azure.Storage.Blob.getContainerAccessControlList";
    };
    GenerateBlobSasPanelViewModel.prototype.getAclOperationParameters = function () {
        return {
            connectionString: this.connectionString,
            containerName: this.containerName
        };
    };
    GenerateBlobSasPanelViewModel.prototype.appendParameters = function (baseParameters) {
        baseParameters.blobAsContainerSas = this.generateContainerLevelSas();
        return baseParameters;
    };
    GenerateBlobSasPanelViewModel.prototype.appendSettings = function (baseSettings) {
        return baseSettings;
    };
    return GenerateBlobSasPanelViewModel;
}(GenerateSasPanelViewModel_1.default));
exports.default = GenerateBlobSasPanelViewModel;
