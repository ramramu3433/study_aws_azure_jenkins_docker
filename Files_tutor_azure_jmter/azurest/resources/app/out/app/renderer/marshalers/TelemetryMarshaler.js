"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
var telemetryManager = require("../telemetry/TelemetryManager");
module.exports = {
    sendEvent: telemetryManager.sendEvent,
    sendMetric: telemetryManager.sendMetric
};
