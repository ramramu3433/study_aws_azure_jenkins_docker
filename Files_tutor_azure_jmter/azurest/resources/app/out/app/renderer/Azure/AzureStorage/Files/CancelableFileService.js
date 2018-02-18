"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var azure_storage_1 = require("azure-storage");
var CancelableFileService = (function (_super) {
    tslib_1.__extends(CancelableFileService, _super);
    function CancelableFileService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CancelableFileService;
}(azure_storage_1.FileService));
exports.default = CancelableFileService;
