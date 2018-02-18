"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var MultipanelDialogViewModel_1 = require("../Common/MultipanelDialogViewModel");
var GenerateSasDialogViewModel = (function (_super) {
    tslib_1.__extends(GenerateSasDialogViewModel, _super);
    function GenerateSasDialogViewModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GenerateSasDialogViewModel.prototype.openShowSasPanel = function (sasArgs) {
        var _this = this;
        this.showSasPanel.load(sasArgs)
            .then(function () { return _this.currentPanel("show-panel"); });
    };
    GenerateSasDialogViewModel.prototype.openGenerateSasPanel = function () {
        this.currentPanel("default-panel");
    };
    return GenerateSasDialogViewModel;
}(MultipanelDialogViewModel_1.default));
exports.default = GenerateSasDialogViewModel;
