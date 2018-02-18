"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var IConflictConfig_1 = require("../../Groups/Conflicts/IConflictConfig");
var IConflictConfig_2 = require("../../Groups/Conflicts/IConflictConfig");
var EncodedNameActions_1 = require("./EncodedNameActions");
var config = {
    policy: "encodedNamePolicy",
    dialogParams: {
        title: "URL Encoded Filename Detected",
        message: "Filename appears to contain encoded characters. Would you like to decode the filename and upload?",
        options: [
            {
                title: {
                    args: ["decodedItemName"],
                    expression: "`Decode and upload as: ${decodedItemName}`"
                },
                value: EncodedNameActions_1.default.Decode
            },
            {
                title: {
                    args: ["encodedItemName"],
                    expression: "`Upload as: ${encodedItemName}`"
                },
                value: EncodedNameActions_1.default.KeepOriginalName
            }
        ],
        defaultOptionValue: "decode",
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
