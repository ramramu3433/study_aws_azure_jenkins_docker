"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var Q = require("q");
var azureAccountsManager = require("../Azure/AzureAccountsManager");
var notificationBarManager = require("../NotificationBarManager");
var telemetry = require("../telemetry/TelemetryManager");
var uiActions = require("../UI/actions/UIActions");
var DialogsManager = require("../DialogsManager");
var UIActions_1 = require("../UI/actions/UIActions");
var Constants_1 = require("../../Constants");
var DeeplinkManager_1 = require("./DeeplinkManager");
var host = global.host;
var openDeeplinkEventName = "StorageExplorer.Deeplink.Open";
var StartupManager = (function () {
    function StartupManager() {
    }
    StartupManager.prototype.validateDeeplink = function (deeplinkUrl) {
        this.deeplinkManager = new DeeplinkManager_1.default(deeplinkUrl);
        return !!this.deeplinkManager.Parameters && !!this.deeplinkManager.Parameters.accountId;
    };
    StartupManager.prototype.navigateToResource = function () {
        var _this = this;
        telemetry.sendEvent(openDeeplinkEventName, {
            "Status": "start",
            "Source": this.deeplinkManager.Parameters.source
        });
        this.queryStorageAccount(this.deeplinkManager.Parameters.subscriptionId, this.deeplinkManager.Parameters.accountId)
            .then(function (storageAccountQueryResult) {
            if (storageAccountQueryResult.nodeNotFound) {
                // If no storage account can be found, we prompt for subscription sign up.
                _this.promptForSubscription();
            }
            else {
                if (_this.deeplinkManager.Parameters.resourceType && _this.deeplinkManager.Parameters.resourceName) {
                    _this.selectAndOpenResource(storageAccountQueryResult);
                }
                else {
                    _this.selectAndExpandAccount(storageAccountQueryResult);
                }
            }
        }).catch(function (error) {
            telemetry.sendError(openDeeplinkEventName, error);
        });
    };
    StartupManager.prototype.queryStorageAccount = function (subscriptionId, accountId) {
        var _this = this;
        return this.querySubscriptionNode(subscriptionId)
            .then(function (subscriptionQueryResult) {
            // Expand subscription node.
            return uiActions.expand(subscriptionQueryResult);
        }).then(function (subscriptionQueryResult) {
            // Find the Storage Accounts node underneath the subscription node and expand it
            var storageAccountsGroupNodeQuery = [
                { name: "type", value: "ResourceTypeGroupNode-ResourceType:Microsoft.Storage/storageAccounts" }
            ];
            return uiActions.expandChildrenWithAttributes(subscriptionQueryResult, storageAccountsGroupNodeQuery)
                .then(function (storageAccountsGroupResult) {
                var accountNodeQuery = [
                    _this.getAccountQuerySelector(accountId.toLowerCase(), subscriptionQueryResult.isExternalSubscription)
                ];
                return uiActions.queryFromAll(storageAccountsGroupResult, accountNodeQuery, true);
            });
        });
    };
    StartupManager.prototype.getAccountQuerySelector = function (accountId, isExternalSubscription) {
        var accountQueryId;
        var accountQueryValue;
        if (isExternalSubscription) {
            accountQueryId = "name";
            accountQueryValue = this.getAccountNameFromAccountId(accountId);
        }
        else {
            accountQueryId = "id";
            accountQueryValue = accountId;
        }
        return { name: accountQueryId, value: accountQueryValue };
    };
    StartupManager.prototype.querySubscriptionNode = function (subscriptionId) {
        var _this = this;
        return host.executeOperation("Azure.getSelectedSubscriptions", [])
            .then(function (selectedSubscriptions) {
            var targetSubscription = _.find(selectedSubscriptions, function (value) {
                return value.id === subscriptionId;
            });
            if (targetSubscription) {
                telemetry.sendEvent(openDeeplinkEventName, {
                    "Status": "findSubscription",
                    "Source": _this.deeplinkManager.Parameters.source
                });
                subscriptionId = targetSubscription.id;
            }
            else {
                telemetry.sendEvent(openDeeplinkEventName, {
                    "Status": "subscriptionNotFound",
                    "Action": "useExternalSubscription",
                    "Source": _this.deeplinkManager.Parameters.source
                });
                subscriptionId = Constants_1.externalSubscriptionId;
            }
            var subscriptionNodeQuery = [{ name: "id", value: subscriptionId }];
            return uiActions.getNodes(subscriptionNodeQuery);
        }).then(function (queryResult) {
            queryResult.isExternalSubscription = subscriptionId === Constants_1.externalSubscriptionId;
            return Q.resolve(queryResult);
        });
    };
    StartupManager.prototype.selectAndExpandAccount = function (accountQuery) {
        telemetry.sendEvent(openDeeplinkEventName, {
            "Status": "selectAccount",
            "Source": this.deeplinkManager.Parameters.source
        });
        uiActions.selectNode(accountQuery)
            .then(function () {
            uiActions.expand(accountQuery);
        });
    };
    StartupManager.prototype.selectAndOpenResource = function (accountResult) {
        var _this = this;
        var resourceType = this.deeplinkManager.Parameters.resourceType;
        var nodeGroupType = resourceType + "Group";
        var nodeGroupQuery = [{ name: "nodeType", value: nodeGroupType }];
        var resourceNodeQuery = [
            { name: "name", value: this.deeplinkManager.Parameters.resourceName },
            { name: "nodeType", value: resourceType }
        ];
        var selectAndOpenCore = function (queryResult) {
            if (queryResult && queryResult.uids && queryResult.uids.length) {
                telemetry.sendEvent(openDeeplinkEventName, {
                    "Status": "selectAndOpen",
                    "Source": _this.deeplinkManager.Parameters.source
                });
                // If there exists the targeted resource node. Do two things where order doesn't matter.
                // - Select it.
                // - Open it.
                host.executeOperation(UIActions_1.actionNamespaces.select, { queryResult: queryResult });
                host.executeOperation(UIActions_1.actionNamespaces.executeDefaultAction, { queryResult: queryResult }).catch(function (error) {
                    telemetry.sendError("StorageExplorer.Deeplink.Open.selectAndOpenResource", error);
                });
            }
        };
        // Expand the specified storage account node
        uiActions.expand(accountResult).then(function () {
            // Expand the specified node group, e.g., blob container group.
            return uiActions.expandChildrenWithAttributes(accountResult, nodeGroupQuery);
        }).then(function (nodeGroupResult) {
            // Query for the specified resource node, e.g., a blob container, a table, etc.
            return uiActions.queryFromAll(nodeGroupResult, resourceNodeQuery);
        }).then(function (queryResult) {
            if (queryResult && queryResult.uids && queryResult.uids.length) {
                selectAndOpenCore(queryResult);
            }
            else {
                uiActions.queryFromAllWithAttributes(nodeGroupQuery, resourceNodeQuery)
                    .then(function (result) {
                    if (result && result.nodeNotFound) {
                        telemetry.sendEvent("StorageExplorer.Deeplink.Open.selectAndOpenResource", {
                            "Status": "ResourceNotFound",
                            "Source": _this.deeplinkManager.Parameters.source
                        });
                        notificationBarManager.showSingleLink("Unable to find " + _this.getNameFromResourceType(_this.deeplinkManager.Parameters.resourceType) + " " + _this.deeplinkManager.Parameters.resourceName + ". It may have been deleted or you may not have access to it.", // localize
                        "", Constants_1.InfoBarTypes.errorLink);
                    }
                    else {
                        selectAndOpenCore(result);
                    }
                });
            }
        });
    };
    StartupManager.prototype.promptForSubscription = function () {
        var _this = this;
        azureAccountsManager.getAllSubscriptions(/* ignoreErrors */ true).then(function (subscriptions) {
            var targetSubscription = _.find(subscriptions, function (value) {
                return value.id === _this.deeplinkManager.Parameters.subscriptionId;
            });
            if (targetSubscription) {
                notificationBarManager.showSingleLink("The subscription for this resource is currently filtered out. You need to select the subscription in the account settings panel to see the resource.", // localize
                "Select", // localize
                Constants_1.InfoBarTypes.signUpSubscriptions).then(function (select) {
                    if (select) {
                        telemetry.sendEvent(openDeeplinkEventName, {
                            "Status": "SubscriptionNotSelected",
                            "Action": "CheckSubscription",
                            "Source": _this.deeplinkManager.Parameters.source
                        });
                        host.executeOperation("CloudExplorer.Actions.openPanel", { panelInfo: Constants_1.panelInfos.settingsPanel });
                    }
                    else {
                        telemetry.sendEvent(openDeeplinkEventName, {
                            "Status": "SubscriptionNotSelected",
                            "Action": "Cancel",
                            "Source": _this.deeplinkManager.Parameters.source
                        });
                    }
                });
            }
            else {
                notificationBarManager.showSingleLink("Cannot find the specified subscription for this resource. Please sign in or attach the resource using SAS or account name and key.", // localize
                "Sign in", // localize
                Constants_1.InfoBarTypes.signUpSubscriptions).then(function (signIn) {
                    if (signIn) {
                        telemetry.sendEvent(openDeeplinkEventName, {
                            "Status": "SubscriptionNotSignUp",
                            "Action": "SignUpSubscription",
                            "Source": _this.deeplinkManager.Parameters.source
                        });
                        DialogsManager.openDialog({
                            id: "ConnectDialog",
                            parameters: { startPage: "azureSignIn" }
                        });
                    }
                    else {
                        telemetry.sendEvent(openDeeplinkEventName, {
                            "Status": "SubscriptionNotSignUp",
                            "Action": "Cancel",
                            "Source": _this.deeplinkManager.Parameters.source
                        });
                    }
                });
            }
        });
    };
    StartupManager.prototype.getAccountNameFromAccountId = function (accountId) {
        var accountName;
        if (accountId) {
            var idSegments = accountId.split("/");
            if (idSegments && idSegments.length) {
                // The last element is account name.
                accountName = idSegments.pop();
            }
        }
        return accountName;
    };
    StartupManager.prototype.getNameFromResourceType = function (resourceType) {
        var typeName;
        switch (resourceType) {
            case Constants_1.storageTypes.blobContainer:
                typeName = Constants_1.storageTypeNames.blobContainer;
                break;
            case Constants_1.storageTypes.fileShare:
                typeName = Constants_1.storageTypeNames.fileShare;
                break;
            case Constants_1.storageTypes.table:
                typeName = Constants_1.storageTypeNames.table;
                break;
            case Constants_1.storageTypes.queue:
                typeName = Constants_1.storageTypeNames.queue;
                break;
            default:
                console.log("Unsupported resource type " + resourceType);
                break;
        }
        return typeName;
    };
    return StartupManager;
}());
var instance = new StartupManager();
exports.default = instance;
