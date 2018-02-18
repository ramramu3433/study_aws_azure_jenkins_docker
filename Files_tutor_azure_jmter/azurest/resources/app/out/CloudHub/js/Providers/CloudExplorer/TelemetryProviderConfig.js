/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var TelemetryProviderConfig = (function () {
        function TelemetryProviderConfig() {
            this.namespace = "CloudExplorer.Telemetry";
            this.marshalerProviderConfig = {
                assemblyName: "Microsoft.VisualStudio.CloudExplorer.Host",
                typeName: "Microsoft.VisualStudio.CloudHub.Host.Providers.CloudExplorer.TelemetryProvider"
            };
            this.exports = [
                "CloudExplorer.Actions.Telemetry.sendEvent",
                "CloudExplorer.Actions.Telemetry.sendMetric"
            ];
        }
        return TelemetryProviderConfig;
    }());
    return TelemetryProviderConfig;
});
