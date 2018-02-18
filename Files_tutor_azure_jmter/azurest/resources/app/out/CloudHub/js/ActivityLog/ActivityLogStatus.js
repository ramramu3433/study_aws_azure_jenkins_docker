/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var ActivityLogStatus;
    (function (ActivityLogStatus) {
        ActivityLogStatus[ActivityLogStatus["Pending"] = 0] = "Pending";
        ActivityLogStatus[ActivityLogStatus["InProgress"] = 1] = "InProgress";
        ActivityLogStatus[ActivityLogStatus["Success"] = 2] = "Success";
        ActivityLogStatus[ActivityLogStatus["Error"] = 3] = "Error";
        ActivityLogStatus[ActivityLogStatus["Attention"] = 4] = "Attention";
        ActivityLogStatus[ActivityLogStatus["Canceled"] = 5] = "Canceled";
        ActivityLogStatus[ActivityLogStatus["Info"] = 6] = "Info";
    })(ActivityLogStatus || (ActivityLogStatus = {}));
    return ActivityLogStatus;
});
