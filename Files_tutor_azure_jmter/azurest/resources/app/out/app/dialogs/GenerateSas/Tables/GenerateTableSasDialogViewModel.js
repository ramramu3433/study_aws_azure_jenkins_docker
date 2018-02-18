"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var GenerateSasDialogViewModel_1 = require("../GenerateSasDialogViewModel");
var GenerateTableSasPanelViewModel_1 = require("./GenerateTableSasPanelViewModel");
var ShowTableSasPanelViewModel_1 = require("./ShowTableSasPanelViewModel");
/**
 * Dialog View model for generating shared access signatures for tables.
 */
var GenerateTableSasDialogViewModel = (function (_super) {
    tslib_1.__extends(GenerateTableSasDialogViewModel, _super);
    function GenerateTableSasDialogViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.generateSasPanel = new GenerateTableSasPanelViewModel_1.default(_this, parameters);
        _this.showSasPanel = new ShowTableSasPanelViewModel_1.default(_this, parameters);
        return _this;
    }
    return GenerateTableSasDialogViewModel;
}(GenerateSasDialogViewModel_1.default));
exports.default = GenerateTableSasDialogViewModel;
