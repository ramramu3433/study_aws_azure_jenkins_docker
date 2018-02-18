"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var GenerateSasDialogViewModel_1 = require("../GenerateSasDialogViewModel");
var GenerateQueueSasPanelViewModel_1 = require("./GenerateQueueSasPanelViewModel");
var ShowQueueSasPanelViewModel_1 = require("./ShowQueueSasPanelViewModel");
/**
 * Dialog View model for generating shared access signatures for queues.
 */
var GenerateQueueSasDialogViewModel = (function (_super) {
    tslib_1.__extends(GenerateQueueSasDialogViewModel, _super);
    function GenerateQueueSasDialogViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.generateSasPanel = new GenerateQueueSasPanelViewModel_1.default(_this, parameters);
        _this.showSasPanel = new ShowQueueSasPanelViewModel_1.default(_this, parameters);
        return _this;
    }
    return GenerateQueueSasDialogViewModel;
}(GenerateSasDialogViewModel_1.default));
exports.default = GenerateQueueSasDialogViewModel;
