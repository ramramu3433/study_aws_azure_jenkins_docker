"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var GenerateSasPanelViewModel_1 = require("../GenerateSasPanelViewModel");
var SwitchValueViewModel_1 = require("../../Common/SwitchValueViewModel");
/**
 * View model for Generate Shared Access Signature dialog
 */
var GenerateQueueSasViewModel = (function (_super) {
    tslib_1.__extends(GenerateQueueSasViewModel, _super);
    function GenerateQueueSasViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        _this.readLabel = "Read"; // localize
        _this.addLabel = "Add"; // localize
        _this.updateLabel = "Update"; // localize
        _this.processLabel = "Process"; // localize
        _this.queueName = parameters.queueName;
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", _this.readLabel),
            new SwitchValueViewModel_1.default("a", _this.addLabel),
            new SwitchValueViewModel_1.default("u", _this.updateLabel),
            new SwitchValueViewModel_1.default("p", _this.processLabel)
        ]);
        _this.initialize();
        return _this;
    }
    GenerateQueueSasViewModel.prototype.getAclOperation = function () {
        return "Azure.Storage.Queue.getAccessControlList";
    };
    GenerateQueueSasViewModel.prototype.getAclOperationParameters = function () {
        return {
            connectionString: this.connectionString,
            queueName: this.queueName
        };
    };
    GenerateQueueSasViewModel.prototype.appendParameters = function (baseParameters) {
        return baseParameters;
    };
    GenerateQueueSasViewModel.prototype.appendSettings = function (baseSettings) {
        return baseSettings;
    };
    return GenerateQueueSasViewModel;
}(GenerateSasPanelViewModel_1.default));
exports.default = GenerateQueueSasViewModel;
