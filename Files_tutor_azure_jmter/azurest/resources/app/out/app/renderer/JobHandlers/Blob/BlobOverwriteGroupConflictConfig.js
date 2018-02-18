"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var IConflictConfig_1 = require("../Groups/Conflicts/IConflictConfig");
var IConflictConfig_2 = require("../Groups/Conflicts/IConflictConfig");
var BlobOverwriteOptions_1 = require("./BlobOverwriteOptions");
var config = {
    policy: "remoteOverwritePolicy",
    dialogParams: {
        title: "Upload Conflict",
        message: {
            args: ["conflictedItemName"],
            expression: "`An item named ${conflictedItemName} already exists. How would you like to resolve the conflict?`"
        },
        options: [
            {
                title: "Create snapshot and replace",
                value: BlobOverwriteOptions_1.default.Snapshot
            },
            {
                title: "Replace",
                value: BlobOverwriteOptions_1.default.Overwrite
            },
            {
                title: "Do not upload",
                value: BlobOverwriteOptions_1.default.Skip
            }
        ],
        defaultOptionValue: "snapshot",
        buttons: [
            {
                title: "Apply to All",
                value: IConflictConfig_1.ApplyToAllValue
            },
            {
                title: "Apply",
                value: IConflictConfig_2.ApplyValue
            }
        ]
    }
};
exports.default = config;
