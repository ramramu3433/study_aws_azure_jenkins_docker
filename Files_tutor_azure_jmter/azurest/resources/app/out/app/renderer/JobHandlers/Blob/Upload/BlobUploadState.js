"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var BlobUploadState = {
    Failed: "failed",
    Complete: "complete",
    Canceled: "canceled",
    Skipped: "skipped",
    WaitingToStart: "waitingToStart",
    Active: "active",
    Starting: "starting",
    Canceling: "canceling",
    Conflicted: "conflicted"
};
exports.default = BlobUploadState;
