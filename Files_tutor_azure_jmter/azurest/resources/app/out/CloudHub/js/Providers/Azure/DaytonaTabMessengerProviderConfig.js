/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var DaytonaTabMessengerProviderConfig = (function () {
        function DaytonaTabMessengerProviderConfig() {
            this.namespace = "DaytonaTabMessenger";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/DaytonaTabMessengerProvider",
                useChildProcess: false
            };
            this.exports = [
                "DaytonaTabMessenger.broadcastEvent"
            ];
        }
        return DaytonaTabMessengerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = DaytonaTabMessengerProviderConfig;
});
