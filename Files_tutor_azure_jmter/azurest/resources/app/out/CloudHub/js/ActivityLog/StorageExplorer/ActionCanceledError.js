/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    exports.name = "ActionCanceledError";
    /**
     * Class to handle the Activity Log lifecycle of an operation that can
     * be canceled or retried.
     */
    var ActionCanceledError = (function () {
        function ActionCanceledError(message) {
            this.name = exports.name;
            this.message = message || "Canceled."; // Localize
        }
        return ActionCanceledError;
    }());
    exports.ActionCanceledError = ActionCanceledError;
});
