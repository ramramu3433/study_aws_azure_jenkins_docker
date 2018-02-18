"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var ForkedProcess_1 = require("./ForkedProcess");
var ProcessManager = (function () {
    function ProcessManager() {
    }
    /**
     * Starts a new node.js process.
     * If the child fails to start up properly, the promise will be rejected.
     *
     * @param startupModuleFullPath - Full path to the module that should be loaded in the child process.
     * @param [startupFunctionName] - Function inside the start-up module that will be executed
     * @param [startupFunctionArgs] - Arguments for the start-up function
     */
    ProcessManager.startProcess = function (startupModuleFullPath, startupFunctionName, startupFunctionArgs, debugPort, sslCertDirectory) {
        var child = new ForkedProcess_1.default(startupModuleFullPath, startupFunctionName, startupFunctionArgs, debugPort, sslCertDirectory);
        return child.start().then(function () {
            return child;
        });
    };
    return ProcessManager;
}());
exports.default = ProcessManager;
