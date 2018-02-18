"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// Reference: https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
var SasUriValidationError = {
    DuplicateResourceName: "DuplicateResourceName",
    UnsupportedAttach: "UnsupportedAttach",
    UriEmpty: "UriEmpty",
    UriMissingHost: "UriMissingHost",
    UriMissingPath: "UriMissingPath",
    UriMissingProtocol: "UriMissingProtocol",
    UriMissingToken: "UriMissingToken"
};
exports.default = SasUriValidationError;
