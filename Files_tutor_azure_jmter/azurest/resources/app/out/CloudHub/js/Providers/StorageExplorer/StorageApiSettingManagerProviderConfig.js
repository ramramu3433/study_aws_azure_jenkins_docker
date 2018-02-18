/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var StorageApiSettingManagerProviderConfig = (function () {
        function StorageApiSettingManagerProviderConfig() {
            this.namespace = "StorageApiSettingManagerProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/StorageApiSettingManagerProvider",
                useChildProcess: false // can not run in a child process
            };
            this.exports = [
                "StorageApiSettingManager.getStorageApiSetting"
            ];
        }
        return StorageApiSettingManagerProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = StorageApiSettingManagerProviderConfig;
});
