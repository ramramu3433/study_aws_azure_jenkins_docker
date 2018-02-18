"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var EnvironmentMarshaler = require("../marshalers/EnvironmentMarshaler");
module.exports = {
    "Environment.Clipboard.getClipboardData": function (args) {
        return EnvironmentMarshaler.clipboardGetData(args.format);
    },
    "Environment.Clipboard.setClipboardData": function (args) {
        return EnvironmentMarshaler.clipboardSetData(args.format, args.data);
    }
};
