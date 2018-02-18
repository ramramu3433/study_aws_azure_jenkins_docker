/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise", "Providers/CloudExplorer/RecentlyUsedManager", "Common/Debug"], function (require, exports, es6_promise_1, RecentlyUsedManager_1, Debug) {
    "use strict";
    /**
     * Contains the query actions that return recently used resource nodes.
     */
    var RecentlyUsedNodeProducer = (function () {
        function RecentlyUsedNodeProducer(host) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(RecentlyUsedNodeProducer.getRecentlyUsedResourceNamespace, function () { return _this.getAll(); });
            };
            this._host = host;
            this._manager = new RecentlyUsedManager_1.default();
        }
        /**
         * Gets all quick access nodes.
         */
        RecentlyUsedNodeProducer.prototype.getAll = function (args, continuationToken, resourceTypes, findExactName, searchResourceName) {
            var _this = this;
            if (args === void 0) { args = null; }
            if (continuationToken === void 0) { continuationToken = null; }
            if (resourceTypes === void 0) { resourceTypes = null; }
            if (findExactName === void 0) { findExactName = false; }
            if (searchResourceName === void 0) { searchResourceName = ""; }
            return this._manager.getRecentlyUsedItems().then(function (shortcutItems) {
                var nodePromises = shortcutItems.map(function (shortcutItem) {
                    var node = null;
                    return _this._host.executeOperation(shortcutItem.producerNamespace, [shortcutItem.producerArgs]).then(function (result) {
                        if (result && result.results && result.results.length > 0) {
                            node = result.results[0];
                        }
                        return {
                            element: shortcutItem,
                            node: node
                        };
                    }).catch(function (error) {
                        Debug.error(error);
                        return {
                            element: shortcutItem,
                            node: null
                        };
                    });
                });
                return es6_promise_1.Promise.all(nodePromises).then(function (nodeResults) {
                    var result = {
                        results: nodeResults.filter(function (item) { return item.node; }).map(function (item) { return item.node; })
                    };
                    return result;
                });
            });
        };
        return RecentlyUsedNodeProducer;
    }());
    RecentlyUsedNodeProducer.getRecentlyUsedResourceNamespace = "Azure.Producers.ResourceTypes.GetRecentlyUsed";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RecentlyUsedNodeProducer;
});
