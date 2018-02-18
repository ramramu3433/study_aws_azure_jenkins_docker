"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var Assert = function (value, message) {
    if (!value) {
        throw new Error(message);
    }
};
exports.default = Assert;
