/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * A provider for displaying native message boxes.
     */
    var ActivityResponseProviderConfig = (function () {
        function ActivityResponseProviderConfig() {
            this.namespace = "Activities.Response";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/ActivityResponseProvider",
                useChildProcess: false
            };
            this.exports = [
                "Activities.handleError"
            ];
        }
        return ActivityResponseProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ActivityResponseProviderConfig;
});
