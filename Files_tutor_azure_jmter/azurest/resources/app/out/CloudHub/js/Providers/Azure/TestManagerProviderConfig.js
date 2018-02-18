/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var TestManagerProviderConfig = (function () {
        function TestManagerProviderConfig() {
            this.namespace = "TestManagerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/TestManagerProvider",
                useChildProcess: false
            };
            this.exports = [
                "TestManager.getTestGroups",
                "TestManager.runAll",
                "TestManager.executeTest",
                "TestManager.executeTestGroup",
                "ActivityManager.onExecuteActionEvent"
            ];
        }
        return TestManagerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TestManagerProviderConfig;
});
