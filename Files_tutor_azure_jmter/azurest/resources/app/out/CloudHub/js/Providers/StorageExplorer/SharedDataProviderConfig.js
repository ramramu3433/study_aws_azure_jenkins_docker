/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    var SharedDataProviderConfig = (function () {
        function SharedDataProviderConfig() {
            this.namespace = "SharedDataProvider";
            this.nodeJSProviderConfig = {
                nodeJSRequirePath: "../providers/SharedDataProvider",
                useChildProcess: true
            };
            this.exports = [
                "SharedDataManager.createSharedData",
                "SharedDataManager.readSharedData",
                "SharedDataManager.getSharedDataLease",
                "SharedDataManager.renewSharedDataLease",
                "SharedDataManager.endSharedDataLease",
                "SharedDataManager.updateSharedData",
                "SharedDataManager.deleteSharedData"
            ];
        }
        return SharedDataProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = SharedDataProviderConfig;
});
