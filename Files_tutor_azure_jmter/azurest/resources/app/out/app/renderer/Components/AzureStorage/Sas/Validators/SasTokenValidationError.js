"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// Reference: https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
var SasTokenValidationError = {
    Expired: "Expired",
    InadequateAccountPermissions: "InadequateAccountPermissions",
    InadequateAccountResourceTypeAccess: "InadequateAccountResourceTypeAccess",
    InadequateAccountServiceAccess: "InadequateAccountServiceAccess",
    InadequateBlobPermissions: "InadequateBlobPermissions",
    InadequateFilePermissions: "InadequateFilePermissions",
    InadequateQueuePermissions: "InadequateQueuePermissions",
    InadequateTablePermissions: "InadequateTablePermissions",
    MissingParamExpiryOrIdentifier: "MissingParamExpiryOrIdentifier",
    MissingParamPermissions: "MissingParamPermissions",
    MissingParamResource: "MissingParamResource",
    MissingParamResourceTypes: "MissingParamResourceTypes",
    MissingParamServices: "MissingParamServices",
    MissingParamSignature: "MissingParamSignature",
    MissingParamTableName: "MissingParamTableName",
    MissingParamVersion: "MissingParamVersion",
    TokenEmpty: "TokenEmpty",
    UnsupportedAttach: "UnsupportedAttach"
};
exports.default = SasTokenValidationError;
