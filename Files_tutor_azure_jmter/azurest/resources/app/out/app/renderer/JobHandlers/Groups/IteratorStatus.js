"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var IteratorStatus;
(function (IteratorStatus) {
    IteratorStatus[IteratorStatus["Processing"] = 0] = "Processing";
    IteratorStatus[IteratorStatus["Paused"] = 1] = "Paused";
    IteratorStatus[IteratorStatus["Resuming"] = 2] = "Resuming";
    IteratorStatus[IteratorStatus["Complete"] = 3] = "Complete";
})(IteratorStatus || (IteratorStatus = {}));
exports.default = IteratorStatus;
