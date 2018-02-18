"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Common sizes in units of bytes
 */
var ByteBasedFileSizes = (function () {
    function ByteBasedFileSizes() {
    }
    return ByteBasedFileSizes;
}());
ByteBasedFileSizes.B = 1;
ByteBasedFileSizes.KB = Math.pow(2, 10);
ByteBasedFileSizes.MB = Math.pow(2, 20);
ByteBasedFileSizes.GB = Math.pow(2, 30);
exports.ByteBasedFileSizes = ByteBasedFileSizes;
