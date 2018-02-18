"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var MessagePassingHostProxy_1 = require("../../renderer/Components/Providers/MessagePassingProvider/MessagePassingHostProxy");
var ModuleProviderFactory_1 = require("../../renderer/Components/Providers/ModuleProviderFactory");
var electron_1 = require("electron");
var q = require("q");
var messageHandler = {
    onMessage: function (handler) {
        electron_1.ipcRenderer.on("webview-host-message", function (e, message) {
            console.log("Received a message in webview:");
            console.log(JSON.stringify(message, null, 2));
            handler(message);
        });
    }
};
var messageSender = {
    sendMessage: function (message) {
        console.log("Sending a message from webview:");
        console.log(JSON.stringify(message, null, 2));
        electron_1.ipcRenderer.sendToHost("webview-editor-message", message);
        return q.resolve(undefined);
    }
};
/**
 * A proxy that communicates with the webview proxy in the renderer process to
 * handle operations.
 */
var EditorHostProxy = (function () {
    function EditorHostProxy() {
        var moduleProviderFactory = new ModuleProviderFactory_1.default();
        moduleProviderFactory.registerProvider("Internal.Environment.Editors", "../../editors/Common/WebviewEditorProvider", false);
        this._messagePasser = new MessagePassingHostProxy_1.default(messageHandler, messageSender, moduleProviderFactory);
    }
    EditorHostProxy.prototype.executeOperation = function (namespace, args) {
        return this._messagePasser.executeOperation(namespace, args);
    };
    EditorHostProxy.prototype.raiseEvent = function (namespace, args) {
        return this._messagePasser.raiseEvent(namespace, args);
    };
    return EditorHostProxy;
}());
var instance = new EditorHostProxy();
exports.default = instance;
