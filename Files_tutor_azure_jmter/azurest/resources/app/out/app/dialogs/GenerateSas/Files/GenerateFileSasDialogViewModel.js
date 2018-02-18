"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var GenerateSasDialogViewModel_1 = require("../GenerateSasDialogViewModel");
var GenerateFileSasPanelViewModel_1 = require("./GenerateFileSasPanelViewModel");
var ShowFileSasPanelViewModel_1 = require("./ShowFileSasPanelViewModel");
/**
 * Dialog View model for generating shared access signatures for blobs and blob containers.
 */
var GenerateFileSasDialogViewModel = (function (_super) {
    tslib_1.__extends(GenerateFileSasDialogViewModel, _super);
    function GenerateFileSasDialogViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.generateSasPanel = new GenerateFileSasPanelViewModel_1.default(_this, parameters);
        _this.showSasPanel = new ShowFileSasPanelViewModel_1.default(_this, parameters);
        return _this;
    }
    return GenerateFileSasDialogViewModel;
}(GenerateSasDialogViewModel_1.default));
exports.default = GenerateFileSasDialogViewModel;
