define(["require", "exports", "knockout", "./Shared/Telemetry/TelemetryProcessor", "./Bindings/BindingHandlersRegisterer", "./Platform/Emulator/Main", "./Platform/Portal/Main", "./Platform/RuntimeProxy/Main", "./Platform/MongoEmulator/Main"], function (require, exports, ko, TelemetryProcessor_1, BindingHandlersRegisterer_1, EmulatorMain, PortalMain, RuntimeProxyMain, MongoEmulatorMain) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var explorer;
    if (RuntimeProxyMain.isValidReferrer()) {
        explorer = RuntimeProxyMain.initializeExplorer();
    }
    else if (MongoEmulatorMain.isValidReferrer()) {
        explorer = MongoEmulatorMain.initializeExplorer();
    }
    else if (EmulatorMain.isValidReferrer()) {
        explorer = EmulatorMain.initializeExplorer();
    }
    else if (PortalMain.isValidReferrer()) {
        TelemetryProcessor_1.default.recordInformationMessage("DataExplorer opened in Portal");
        explorer = PortalMain.initializeExplorer();
    }
    if (!!explorer) {
        ko.applyBindings(explorer);
        explorer.postReadyMessage();
        BindingHandlersRegisterer_1.BindingHandlersRegisterer.registerBindingHandlers();
        $("#divExplorer").show();
    }
});
