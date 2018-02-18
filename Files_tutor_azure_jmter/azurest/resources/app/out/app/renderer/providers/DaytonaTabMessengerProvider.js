"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var DaytonaTabMessengerMarshalerFactory_1 = require("../marshalers/DaytonaTabMessengerMarshalerFactory");
var DaytonaTabMessengerProvider = {
    "DaytonaTabMessenger.broadcastEvent": function (args) { return DaytonaTabMessengerMarshalerFactory_1.default.broadCastEvent(args.event, args.args); }
};
module.exports = DaytonaTabMessengerProvider;
