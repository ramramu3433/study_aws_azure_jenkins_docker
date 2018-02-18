/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var MenuManagerProviderConfig = (function () {
        function MenuManagerProviderConfig() {
            this.namespace = "MenuManagerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/MenuManagerProvider",
                useChildProcess: false
            };
            this.exports = [
                "MenuManager.showMenu"
            ];
        }
        return MenuManagerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MenuManagerProviderConfig;
});
