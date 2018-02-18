"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var IConflictConfig_1 = require("../../Groups/Conflicts/IConflictConfig");
var IConflictConfig_2 = require("../../Groups/Conflicts/IConflictConfig");
var UnsafeNameActions_1 = require("./UnsafeNameActions");
var config = {
    policy: "unsafeNamePolicy",
    dialogParams: {
        title: "Unsupported Filename",
        message: "Filename contains unsupported characters. Would you like to encode the filename?",
        options: [
            {
                title: {
                    args: ["safeItemName"],
                    expression: "`Enocde filename and download as: ${safeItemName}`"
                },
                value: UnsafeNameActions_1.default.Encode
            },
            {
                title: "Do not download",
                value: UnsafeNameActions_1.default.Skip
            }
        ],
        defaultOptionValue: UnsafeNameActions_1.default.Skip,
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
