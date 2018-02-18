/*!---------------------------------------------------------
* Copyright (C) Microsoft Corporation. All rights reserved.
*----------------------------------------------------------*/
define(["require", "exports", "ActivityLog/ActivityLogStatus"], function (require, exports, ActivityLogStatus) {
    "use strict";
    /*
     * This is a superset of ActivityLogStatus that allows us to have our own additional status values.
     * Each ActivityLogStatus can map into multiple ExtendedStatus values (see ObservableActivity._extendedStatusToStatus).
     */
    var ExtendedStatus;
    (function (ExtendedStatus) {
        // raw status = pending
        ExtendedStatus[ExtendedStatus["None"] = null] = "None";
        ExtendedStatus[ExtendedStatus["Pending"] = 100] = "Pending";
        // raw status = in progress
        ExtendedStatus[ExtendedStatus["InProgress"] = 101] = "InProgress";
        ExtendedStatus[ExtendedStatus["Retrying"] = 201] = "Retrying";
        ExtendedStatus[ExtendedStatus["Canceling"] = 301] = "Canceling";
        // raw status = success
        ExtendedStatus[ExtendedStatus["Success"] = 102] = "Success";
        // raw status = error
        ExtendedStatus[ExtendedStatus["Error"] = 103] = "Error";
        ExtendedStatus[ExtendedStatus["TooManyErrors"] = 303] = "TooManyErrors";
        // raw status = attention
        ExtendedStatus[ExtendedStatus["Conflict"] = 104] = "Conflict";
        // raw status = canceled
        ExtendedStatus[ExtendedStatus["Canceled"] = 105] = "Canceled"; // = 105
    })(ExtendedStatus || (ExtendedStatus = {}));
    return ExtendedStatus;
});
