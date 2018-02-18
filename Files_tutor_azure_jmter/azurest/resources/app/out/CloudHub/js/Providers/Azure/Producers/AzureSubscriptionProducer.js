/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Utilities", "es6-promise"], function (require, exports, Utilities, es6_promise_1) {
    "use strict";
    /**
     * Contains the query actions that return Azure Resource entitites.
     */
    var AzureResourceProducer = (function () {
        function AzureResourceProducer(azureConnection, host) {
            var _this = this;
            /**
             * Registers querybindings on the given queryBindingManager
             */
            this.registerBindings = function (queryBindingManager) {
                queryBindingManager.addProducerBinding(AzureResourceProducer.getSubscriptionNodes, _this.getSubscriptionNodes);
            };
            /**
             * Gets all resources from all subscriptions.
             */
            this.getSubscriptionNodes = function (args) {
                var numRecentlyUsedNodes = 0;
                var recentlyUsedCountPromise = es6_promise_1.Promise.resolve();
                if (!Utilities.isRunningOnElectron()) {
                    recentlyUsedCountPromise = _this._host.executeProviderOperation("CloudExplorer.RecentlyUsed.Count")
                        .then(function (count) {
                        numRecentlyUsedNodes = count;
                    });
                }
                return recentlyUsedCountPromise.then(function () {
                    return _this._azureConnection.getSelectedSubscriptions();
                })
                    .then(function (subscriptions) {
                    var subscriptionRawData = [];
                    // Adds "Quick Access" node, currently only available in standalone SE.
                    if (Utilities.isRunningOnElectron()) {
                        subscriptionRawData.push({
                            type: "Azure.QuickAccess",
                            attributes: [
                                { name: "id", value: "Azure.QuickAccess" },
                                { name: "name", value: "Quick Access" } // Localize
                            ],
                            // set the resource's uid attribute to be the id so the special case code
                            // in NodeViewModel will make the "Quick Access" node's uid to be Azure.QuickAcess
                            uidAttribute: "id"
                        });
                    }
                    // Adds "Recently Used" node. Only available in VS.
                    if (!Utilities.isRunningOnElectron() && numRecentlyUsedNodes > 0) {
                        subscriptionRawData.push({
                            type: "Azure.RecentlyUsed",
                            attributes: [
                                { name: "id", value: "Azure.RecentlyUsed" },
                                { name: "name", value: "Recently Used" } // Localize
                            ],
                            uidAttribute: "id"
                        });
                    }
                    subscriptionRawData.push({
                        type: "Azure.ExternalSubscription",
                        attributes: [
                            { name: "id", value: "Azure.ExternalSubscription" },
                            // Localize
                            { name: "name", value: Utilities.isRunningOnElectron() ? "(Local and Attached)" : "(Local)" }
                        ]
                    });
                    if (subscriptions) {
                        subscriptions.forEach(function (subscription) {
                            subscriptionRawData.push({
                                type: args.type,
                                attributes: [
                                    { name: "id", value: subscription.id },
                                    { name: "isIsolatedCloud", value: subscription.isIsolatedCloud },
                                    { name: "name", value: subscription.name },
                                    { name: "subscription", value: JSON.stringify(subscription) },
                                    { name: "tenantId", value: subscription.tenantId },
                                    { name: "uid", value: subscription.id + " " + subscription.accountId }
                                ],
                                uidAttribute: "uid"
                            });
                        });
                    }
                    var subscriptionNodes = require("Providers/Azure/Nodes/AzureResourceNodeFactory").convertToNodeCollection(subscriptionRawData);
                    // If there are 4 or less subscriptions, pre-expand the first level; and the Quick Access node and the Recently Used node are always pre-expanded.
                    subscriptionNodes.forEach(function (node) {
                        // Expand the nodes so their children are loaded.
                        var isQuickAccessNode = Utilities.isRunningOnElectron() &&
                            node.attributes.some(function (attribute, index, array) {
                                return attribute.name === "id" && attribute.value === "Azure.QuickAccess";
                            });
                        var isRecentlyUsedNode = !Utilities.isRunningOnElectron() &&
                            node.attributes.some(function (attribute, index, array) {
                                return attribute.name === "id" && attribute.value === "Azure.RecentlyUsed";
                            });
                        node.preExpanded = subscriptionNodes.length <= 4 ||
                            isQuickAccessNode ||
                            isRecentlyUsedNode;
                    });
                    return {
                        results: subscriptionNodes,
                        error: null
                    };
                });
            };
            this._azureConnection = azureConnection;
            this._host = host;
        }
        return AzureResourceProducer;
    }());
    AzureResourceProducer.getSubscriptionNodes = "Azure.Producers.Resources.GetSubscriptionNodes";
    return AzureResourceProducer;
});
