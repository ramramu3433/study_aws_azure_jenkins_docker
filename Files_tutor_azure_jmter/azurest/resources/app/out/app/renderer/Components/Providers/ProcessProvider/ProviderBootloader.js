"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module ProcessProviderBootloader
 * This is the start-up module for child processes created by ProcessProviderManagerMarshaler.
 * It sits in the new process, receiving messages from the parent process via ProcessProviderProxy
 * and interprets and executes them, and returns the resulting values back to the parent process via messages.
 */
console.log("ProcessProviderBootloader handing imports 1");
var Q = require("q");
var MessagePassingHostProxy_1 = require("../MessagePassingProvider/MessagePassingHostProxy");
var ModuleProviderFactory_1 = require("../ModuleProviderFactory");
console.log("ProcessProviderBootloader starting to be loaded in child.");
var messageSender = {
    sendMessage: function (message) {
        console.log("Sending a message from the child:");
        console.log(JSON.stringify(message));
        process.send(message);
        return Q.resolve(null);
    }
};
var messageHandler = {
    onMessage: function (messageHandler) {
        process.on("message", function (message) {
            console.log("Received a message in the child:");
            console.log(JSON.stringify(message));
            messageHandler(message);
        });
    }
};
function init(providerNamespace, nodeJSRequirePath) {
    try {
        var providerFactory = new ModuleProviderFactory_1.default();
        providerFactory.registerProvider(providerNamespace, nodeJSRequirePath, false);
        var hostProxy = new MessagePassingHostProxy_1.default(messageHandler, messageSender, providerFactory);
        if (!global.host) {
            global.host = hostProxy;
        }
        return Q.resolve(null);
    }
    catch (e) {
        // Write the error to console (e.g. unable to load file)
        // TODO: Use logging library instead of writing to console
        console.error(e.message);
        return Q.reject(e);
    }
}
exports.init = init;
;
console.log("ProcessProviderBootloader loaded in child.");
