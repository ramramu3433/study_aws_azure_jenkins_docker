define(["require", "exports", "../Ajax"], function (require, exports, Ajax) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Class for posting messages to the telemetry controller that will then be logged in
    // the Cosmos DB specific Kusto tables.  Use the Portal SDK telemetry framwork if you
    // are not required to log to these tables.
    var TelemetryProcessor = (function () {
        function TelemetryProcessor() {
        }
        TelemetryProcessor.recordInformationMessage = function (message) {
            return Ajax.post(this.TelemetryEndpoint + this.informationMessage, message);
        };
        TelemetryProcessor.recordWarningMessage = function (message) {
            return Ajax.post(this.TelemetryEndpoint + this.warningMessage, message);
        };
        TelemetryProcessor.recordVerboseMessage = function (message) {
            return Ajax.post(this.TelemetryEndpoint + this.verboseMessage, message);
        };
        return TelemetryProcessor;
    }());
    TelemetryProcessor.TelemetryEndpoint = "/api/CosmosDBTelemetry";
    TelemetryProcessor.informationMessage = "/InformationMessage";
    TelemetryProcessor.warningMessage = "/WarningMessage";
    TelemetryProcessor.verboseMessage = "/VerboseMessage";
    exports.default = TelemetryProcessor;
});
