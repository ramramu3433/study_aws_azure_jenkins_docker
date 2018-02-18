"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var IConflictConfig_1 = require("../Groups/Conflicts/IConflictConfig");
var IConflictConfig_2 = require("../Groups/Conflicts/IConflictConfig");
var LocalFileOverwriteOptions_1 = require("./LocalFileOverwriteOptions");
var config = {
    policy: "localOverwritePolicy",
    dialogParams: {
        title: "Download Conflict",
        message: {
            args: ["conflictedItemName"],
            expression: "`An item named ${conflictedItemName} already exists. How would you like to resolve the conflict?`"
        },
        options: [
            {
                title: "Replace",
                value: LocalFileOverwriteOptions_1.default.Overwrite
            },
            {
                title: "Keep both",
                value: LocalFileOverwriteOptions_1.default.KeepBoth
            },
            {
                title: "Do not download",
                value: LocalFileOverwriteOptions_1.default.Skip
            }
        ],
        defaultOptionValue: LocalFileOverwriteOptions_1.default.Overwrite,
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
