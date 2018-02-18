"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var GenerateAccountSasPanelViewModel_1 = require("./GenerateAccountSasPanelViewModel");
var GenerateSasDialogViewModel_1 = require("../GenerateSasDialogViewModel");
var ShowAccountSasPanelViewModel_1 = require("./ShowAccountSasPanelViewModel");
/**
 * Dialog View model for generating shared access signatures for accounts.
 */
var GenerateAccountSasDialogViewModel = (function (_super) {
    tslib_1.__extends(GenerateAccountSasDialogViewModel, _super);
    function GenerateAccountSasDialogViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.generateSasPanel = new GenerateAccountSasPanelViewModel_1.default(_this, parameters);
        _this.showSasPanel = new ShowAccountSasPanelViewModel_1.default(_this, parameters);
        return _this;
    }
    return GenerateAccountSasDialogViewModel;
}(GenerateSasDialogViewModel_1.default));
exports.default = GenerateAccountSasDialogViewModel;
