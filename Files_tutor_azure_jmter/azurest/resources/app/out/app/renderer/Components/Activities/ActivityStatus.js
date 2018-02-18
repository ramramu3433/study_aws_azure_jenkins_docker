"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus[ActivityStatus["Pending"] = 0] = "Pending";
    ActivityStatus[ActivityStatus["InProgress"] = 1] = "InProgress";
    ActivityStatus[ActivityStatus["Success"] = 2] = "Success";
    ActivityStatus[ActivityStatus["Error"] = 3] = "Error";
    ActivityStatus[ActivityStatus["Attention"] = 4] = "Attention";
    ActivityStatus[ActivityStatus["Canceled"] = 5] = "Canceled";
    ActivityStatus[ActivityStatus["Info"] = 6] = "Info";
})(ActivityStatus || (ActivityStatus = {}));
exports.default = ActivityStatus;
