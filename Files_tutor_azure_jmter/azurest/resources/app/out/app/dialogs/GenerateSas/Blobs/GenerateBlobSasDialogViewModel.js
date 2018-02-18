"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var GenerateSasDialogViewModel_1 = require("../GenerateSasDialogViewModel");
var GenerateBlobSasPanelViewModel_1 = require("./GenerateBlobSasPanelViewModel");
var ShowBlobSasPanelViewModel_1 = require("./ShowBlobSasPanelViewModel");
/**
 * Dialog View model for generating shared access signatures for blobs and blob containers.
 */
var GenerateBlobSasDialogViewModel = (function (_super) {
    tslib_1.__extends(GenerateBlobSasDialogViewModel, _super);
    function GenerateBlobSasDialogViewModel(parameters) {
        var _this = _super.call(this) || this;
        _this.generateSasPanel = new GenerateBlobSasPanelViewModel_1.default(_this, parameters);
        _this.showSasPanel = new ShowBlobSasPanelViewModel_1.default(_this, parameters);
        return _this;
    }
    return GenerateBlobSasDialogViewModel;
}(GenerateSasDialogViewModel_1.default));
exports.default = GenerateBlobSasDialogViewModel;
