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
var GenerateFileSasViewModel = (function (_super) {
    tslib_1.__extends(GenerateFileSasViewModel, _super);
    function GenerateFileSasViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        _this.readLabel = "Read"; // Localize
        _this.writeLabel = "Write"; // Localize
        _this.deleteLabel = "Delete"; // Localize
        _this.listLabel = "List"; // Localize
        _this.shareName = parameters.shareName;
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", _this.readLabel),
            new SwitchValueViewModel_1.default("w", _this.writeLabel),
            new SwitchValueViewModel_1.default("d", _this.deleteLabel),
            new SwitchValueViewModel_1.default("l", _this.listLabel)
        ]);
        _this.initialize();
        return _this;
    }
    GenerateFileSasViewModel.prototype.getAclOperation = function () {
        return "Azure.Storage.File.getContainerAccessControlList";
    };
    GenerateFileSasViewModel.prototype.getAclOperationParameters = function () {
        return {
            connectionString: this.connectionString,
            shareName: this.shareName
        };
    };
    GenerateFileSasViewModel.prototype.appendParameters = function (baseParameters) {
        return baseParameters;
    };
    GenerateFileSasViewModel.prototype.appendSettings = function (baseSettings) {
        return baseSettings;
    };
    return GenerateFileSasViewModel;
}(GenerateSasPanelViewModel_1.default));
exports.default = GenerateFileSasViewModel;
