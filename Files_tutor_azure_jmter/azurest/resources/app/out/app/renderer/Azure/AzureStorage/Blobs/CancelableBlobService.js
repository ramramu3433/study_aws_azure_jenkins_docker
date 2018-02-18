"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var azure_storage_1 = require("azure-storage");
var CancelableBlobService = (function (_super) {
    tslib_1.__extends(CancelableBlobService, _super);
    function CancelableBlobService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CancelableBlobService;
}(azure_storage_1.BlobService));
exports.default = CancelableBlobService;
