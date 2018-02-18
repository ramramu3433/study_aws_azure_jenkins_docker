/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var default_1 = (function () {
        function default_1() {
            this.namespace = "Testing.Errors.InProc";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/Testing.Errors.InProcProvider",
                useChildProcess: false
            };
            this.exports = [
                "Testing.Errors.InProc.throwPrimitive",
                "Testing.Errors.InProc.throwString",
                "Testing.Errors.InProc.throwObject",
                "Testing.Errors.InProc.throwError",
                "Testing.Errors.InProc.throwSystemError"
            ];
        }
        return default_1;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    ;
});
