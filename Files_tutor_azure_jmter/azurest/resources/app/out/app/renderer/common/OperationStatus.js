"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var OperationStatus;
(function (OperationStatus) {
    OperationStatus[OperationStatus["Succeeded"] = 0] = "Succeeded";
    OperationStatus[OperationStatus["Failed"] = 1] = "Failed";
    OperationStatus[OperationStatus["Aborted"] = 2] = "Aborted";
})(OperationStatus || (OperationStatus = {}));
exports.default = OperationStatus;
