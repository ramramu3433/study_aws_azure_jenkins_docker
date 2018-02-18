/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/CloudExplorer/Producers/RecentlyUsedNodeProducer", "Providers/CloudExplorer/Actions/RecentlyUsedActions"], function (require, exports, RecentlyUsedNodeProducer_1, RecentlyUsedActions_1) {
    "use strict";
    var RecentlyUsedProviderConfig = (function () {
        function RecentlyUsedProviderConfig() {
            this.namespace = "Azure.CloudExplorer.RecentlyUsed";
            this.requirePath = "Providers/CloudExplorer/RecentlyUsedProvider";
            this.exports = [
                RecentlyUsedNodeProducer_1.default.getRecentlyUsedResourceNamespace,
                RecentlyUsedActions_1.default.addToRecentlyUsedNamespace,
                RecentlyUsedActions_1.default.getCountRecentlyUsedNamespace
            ];
        }
        return RecentlyUsedProviderConfig;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RecentlyUsedProviderConfig;
});
