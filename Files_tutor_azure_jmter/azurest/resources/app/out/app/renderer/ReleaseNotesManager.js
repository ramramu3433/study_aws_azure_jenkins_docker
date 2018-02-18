"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var IsolatedEnvironment_1 = require("./UI/Tabs/IsolatedEnvironment");
var ShellViewModel_1 = require("./UI/ShellViewModel");
var telemetry = require("./telemetry/TelemetryManager");
var request = require("request");
var Utilities = require("../Utilities");
var localReleaseNotes = "./ReleaseNotes.html";
var htmlEditorManifest = "./app/editors/HtmlEditor/HtmlEditor.json";
var releaseNotesBlobUrl = "https://storageexplorerpublish.blob.core.windows.net/releasenotes/";
function didUpdateSinceLastRun() {
    var storageKey = "Standalone_VersionOnLastRun_v1";
    var currentVersion = Utilities.getVersion();
    var versionOnLastRun = Utilities.loadSettings(storageKey, telemetry.sendError);
    if (!versionOnLastRun || (currentVersion !== versionOnLastRun) || Utilities.isDebug()) {
        openReleaseNotes();
    }
    if (!Utilities.isDebug()) {
        // don't mess with settings if in debug mode
        Utilities.saveSettings(storageKey, currentVersion, telemetry.sendError);
    }
}
exports.didUpdateSinceLastRun = didUpdateSinceLastRun;
function openReleaseNotes() {
    var currentVersion = Utilities.getVersion();
    var name = "Release Notes: " + currentVersion;
    var resourcePath = "Html Editor/LocalReleaseNotes/" + name;
    ShellViewModel_1.default.editorPanelViewModel.showTab(name, resourcePath, {
        environment: IsolatedEnvironment_1.default.Webview,
        parameters: { htmlFile: localReleaseNotes },
        source: htmlEditorManifest,
        temporaryTab: false,
        newTab: false
    });
}
exports.openReleaseNotes = openReleaseNotes;
function openRemoteReleaseNotes(versionString) {
    var url = releaseNotesBlobUrl + versionString + ".html";
    var name = "Release Notes: " + versionString;
    var resourcePath = "Html Editor/RemoteReleaseNotes/" + name;
    request.get(url, function (error, response, body) {
        if (!error) {
            ShellViewModel_1.default.editorPanelViewModel.showTab(name, resourcePath, {
                environment: IsolatedEnvironment_1.default.Webview,
                parameters: { htmlData: body },
                source: htmlEditorManifest,
                temporaryTab: false,
                newTab: false
            });
        }
    });
}
exports.openRemoteReleaseNotes = openRemoteReleaseNotes;
