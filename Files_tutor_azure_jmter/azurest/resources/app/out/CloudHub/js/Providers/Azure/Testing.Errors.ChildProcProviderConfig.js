/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var default_1 = (function () {
        function default_1() {
            this.namespace = "Testing.Errors.ChildProc";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/Testing.Errors.ChildProcProvider",
                useChildProcess: true
            };
            this.exports = [
                "Testing.Errors.ChildProc.throwPrimitive",
                "Testing.Errors.ChildProc.throwString",
                "Testing.Errors.ChildProc.throwObject",
                "Testing.Errors.ChildProc.throwError",
                "Testing.Errors.ChildProc.throwSystemError"
            ];
        }
        return default_1;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    ;
});
