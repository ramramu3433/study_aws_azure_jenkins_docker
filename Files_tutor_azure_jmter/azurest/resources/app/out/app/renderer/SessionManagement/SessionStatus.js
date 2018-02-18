"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var SessionStatus;
(function (SessionStatus) {
    SessionStatus[SessionStatus["Active"] = 0] = "Active";
    SessionStatus[SessionStatus["Resume"] = 1] = "Resume";
    SessionStatus[SessionStatus["Delete"] = 2] = "Delete";
    SessionStatus[SessionStatus["Resumed"] = 3] = "Resumed";
    SessionStatus[SessionStatus["Expired"] = 4] = "Expired";
})(SessionStatus || (SessionStatus = {}));
exports.default = SessionStatus;
