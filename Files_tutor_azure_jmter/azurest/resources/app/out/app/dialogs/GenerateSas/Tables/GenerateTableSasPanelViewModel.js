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
 * View model for Generate Shared Access Signature dialog used for tables.
 */
var GenerateTableSasViewModel = (function (_super) {
    tslib_1.__extends(GenerateTableSasViewModel, _super);
    function GenerateTableSasViewModel(dialogViewModel, parameters) {
        var _this = _super.call(this, dialogViewModel, parameters) || this;
        _this.queryLabel = "Query"; // localize
        _this.addLabel = "Add"; // localize
        _this.updateLabel = "Update"; // localize
        _this.deleteLabel = "Delete"; // localize
        /* Labels */
        _this.entityRestrictionsLabel = "Entity Restrictions (optional)"; // localize
        _this.rangeStartLabel = "Start:"; // localize
        _this.rangeEndLabel = "End:"; // localize
        _this.rangeStartPKPlaceholder = "Starting partition key"; // Localize
        _this.rangeStartRKPlaceholder = "Starting row key"; // Localize
        _this.rangeEndPKPlaceholder = "Ending partition key"; // Localize
        _this.rangeEndRKPlaceholder = "Ending row key"; // Localize
        /* Observables */
        _this.startPartitionKey = ko.observable("");
        _this.endPartitionKey = ko.observable("");
        _this.startRowKey = ko.observable("");
        _this.endRowKey = ko.observable("");
        _this.permissionViewModels([
            new SwitchValueViewModel_1.default("r", _this.queryLabel),
            new SwitchValueViewModel_1.default("a", _this.addLabel),
            new SwitchValueViewModel_1.default("u", _this.updateLabel),
            new SwitchValueViewModel_1.default("d", _this.deleteLabel)
        ]);
        _this.loadSettingsOrDefault()
            .then(function (settings) {
            _this.tableName = parameters.tableName;
            _this.startPartitionKey(settings.startPartitionKey || "");
            _this.endPartitionKey(settings.endPartitionKey || "");
            _this.startRowKey(settings.startRowKey || "");
            _this.endRowKey(settings.endRowKey || "");
        });
        _this.initialize();
        return _this;
    }
    GenerateTableSasViewModel.prototype.getAclOperation = function () {
        return "Azure.Storage.Table.getAccessControlList";
    };
    GenerateTableSasViewModel.prototype.getAclOperationParameters = function () {
        return {
            connectionString: this.connectionString,
            tableName: this.tableName
        };
    };
    GenerateTableSasViewModel.prototype.appendParameters = function (baseParameters) {
        baseParameters.startPartitionKey = this.startPartitionKey() || undefined;
        baseParameters.endPartitionKey = this.endPartitionKey() || undefined;
        baseParameters.startRowKey = this.startRowKey() || undefined;
        baseParameters.endRowKey = this.endRowKey() || undefined;
        return baseParameters;
    };
    GenerateTableSasViewModel.prototype.appendSettings = function (baseSettings) {
        baseSettings.startPartitionKey = this.startPartitionKey();
        baseSettings.endPartitionKey = this.endPartitionKey();
        baseSettings.startRowKey = this.startRowKey();
        baseSettings.endRowKey = this.endRowKey();
        return baseSettings;
    };
    return GenerateTableSasViewModel;
}(GenerateSasPanelViewModel_1.default));
exports.default = GenerateTableSasViewModel;
