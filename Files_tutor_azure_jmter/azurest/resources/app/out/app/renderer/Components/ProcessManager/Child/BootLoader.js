"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module BootLoader
 * This is the start-up code for processes created with ProcessManager.
 *
 * We hook up error handling mechanisms immediately to handle premature errors,
 * such as modules failing to load.
 */
var ExceptionSerialization_1 = require("../../Errors/ExceptionSerialization");
var util = require("util");
console.error = function (message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    sendConsoleMessageToParent.apply(void 0, ["error", message].concat(args));
};
console.warn = function (message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    sendConsoleMessageToParent.apply(void 0, ["warn", message].concat(args));
};
console.log = function (message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    sendConsoleMessageToParent.apply(void 0, ["log", message].concat(args));
};
function sendConsoleMessageToParent(messageType, message) {
    var optionalParams = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        optionalParams[_i - 2] = arguments[_i];
    }
    if (typeof message === "string") {
        message = util.format.apply(util, [message].concat(optionalParams));
    }
    var messageObject = {
        $isProcessManagerMessage: true,
        childPid: process.pid
    };
    messageObject[messageType] = messageType === "error" || messageType === "unhandledException" ?
        ExceptionSerialization_1.default.serialize(message) :
        message;
    process.send(messageObject);
}
process.on("uncaughtException", function (error) {
    sendConsoleMessageToParent("unhandledException", error);
    process.nextTick(function () { return process.exit(1); });
});
// Imports
var syswidecas = require("syswide-cas");
console.log("Child process started.");
process.on("unhandledRejection", function (error) {
    // Print out any promises with unhandled rejections
    console.error("UNHANDLED PROMISE REJECTION: ");
    console.error(error);
});
// 0th argument is the path of the node instance (electron.exe)
// 1st argument is the path to this module
// 2nd parameter is the module path caller wants to execute in this process
// 3rd parameter is the start-up function name (optional)
// 4th parameter is the start-up function's arguments (optional)
// 5th parameter is a directory of SSL certs to give to syswide-cas (optional)
var startupModulePath = process.argv[2];
var startupFunctionName = process.argv[3];
var startupFunctionArgs = JSON.parse(process.argv[4] || null);
var sslCertDir = process.argv[5];
console.log(JSON.stringify(sslCertDir));
if (!!sslCertDir) {
    syswidecas.addCAs(sslCertDir);
}
console.log("Attempting to start: " + startupModulePath);
// Load up the requested module (which could run code)
var startupModule = require(startupModulePath);
console.log("Child process start-up module loaded: " + startupModulePath);
if (startupFunctionName && startupFunctionName in startupModule) {
    startupModule[startupFunctionName].apply(null, startupFunctionArgs);
}
// Let the parent know that we've successfully started up
process.send({
    $isProcessManagerMessage: true,
    ackFromChild: true,
    childPid: process.pid
});
