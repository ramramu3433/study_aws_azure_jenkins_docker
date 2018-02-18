/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var PersistentStorageProviderConfig = (function () {
        function PersistentStorageProviderConfig() {
            this.namespace = "PersistentStorage";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/PersistentStorageProvider",
                useChildProcess: false
            };
            this.exports = [
                "PersistentStorage.Local.getItem",
                "PersistentStorage.Local.setItem",
                "PersistentStorage.Local.deleteItem",
                "PersistentStorage.Session.getItem",
                "PersistentStorage.Session.setItem",
                "PersistentStorage.Session.deleteItem"
            ];
        }
        return PersistentStorageProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = PersistentStorageProviderConfig;
});
