"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
// Reference: https://azure.microsoft.com/en-us/documentation/articles/storage-configure-connection-string/
var ConnectionStringValidationError = {
    ConnectionStringEmpty: "ConnectionStringEmpty",
    EndpointTokenMismatch: "EndpointTokenMismatch",
    InadequateAccountServiceAccess: "InadequateAccountServiceAccess",
    InvalidEndpoint: "InvalidEndpoint",
    MissingAccountKeyOrToken: "MissingAccountKeyOrToken",
    MissingAccountName: "MissingAccountName",
    MissingEndpoint: "MissingEndpoint",
    UnsupportedAttach: "UnsupportedAttach"
};
exports.default = ConnectionStringValidationError;
