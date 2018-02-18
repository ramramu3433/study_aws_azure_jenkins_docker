/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../Scripts/global.d.ts" />
    var TelemetryActions = (function () {
        function TelemetryActions(host) {
            var _this = this;
            /**
             * Sends a telemetry event to the host.
             */
            this.sendEvent = function (name, telemetryProperties) {
                return _this._host.executeOperation(TelemetryActions.sendEventNamespace, [name, telemetryProperties]);
            };
            /**
             * Sends a telemetry error event to the host.
             */
            this.sendError = function (errorInfo) {
                // Prepare the telemetry event information
                var telemetryEvent = errorInfo.properties || {};
                telemetryEvent.name = errorInfo.name;
                var err = errorInfo.error;
                // Check if an error was passed
                if (!!err) {
                    telemetryEvent.errorName = err.name;
                    telemetryEvent.file = err.source;
                    telemetryEvent.stack = err.stack;
                    // If the error is a string, it represents the message itself.
                    telemetryEvent.message = (typeof err === "string") ? err : err.message;
                }
                return _this._host.executeOperation(TelemetryActions.sendEventNamespace, [TelemetryActions.errorEventName, telemetryEvent]);
            };
            /**
             * Sends a telemetry metric to the host.
             */
            this.sendMetric = function (name, metricNumber, telemetryProperties) {
                return _this._host.executeOperation(TelemetryActions.sendMetricNamespace, [name, metricNumber, telemetryProperties]);
            };
            this._host = host;
        }
        return TelemetryActions;
    }());
    TelemetryActions.namespace = "Telemetry";
    TelemetryActions.errorEventName = "CloudHub.Error";
    /**
     * sendEvent action namespace.
     * Keep in sync with its function name.
     */
    TelemetryActions.sendEventNamespace = TelemetryActions.namespace + ".sendEvent";
    /**
     * sendMetric action namespace.
     * Keep in sync with its function name.
     */
    TelemetryActions.sendMetricNamespace = TelemetryActions.namespace + ".sendMetric";
    return TelemetryActions;
});
