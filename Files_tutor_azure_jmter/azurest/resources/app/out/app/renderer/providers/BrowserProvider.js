"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var EnvironmentMarshaler = require("../marshalers/EnvironmentMarshaler");
module.exports = {
    "Environment.Browser.openUrl": function (args) {
        return EnvironmentMarshaler.openUrl(args.url);
    }
};
