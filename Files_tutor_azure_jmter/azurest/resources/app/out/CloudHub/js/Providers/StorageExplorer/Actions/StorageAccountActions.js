/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Providers/Common/AzureStorageConstants"], function (require, exports, AzureStorageConstants) {
    "use strict";
    var StorageAccountActions = (function () {
        function StorageAccountActions(host, telemetry) {
            var _this = this;
            /**
             * Registers actionbindings on the given actionBindingManager
             */
            this.registerBindings = function (actionBindingManager) {
                actionBindingManager.addActionBinding(StorageAccountActions.copyLinkToResource, _this.copyLinkToResource);
            };
            this.copyLinkToResource = function (args) {
                var queryItems = _this.buildQueryItems(args);
                var deeplink = _this.buildDeeplink(queryItems);
                var data = {
                    text: deeplink,
                    html: "<a href='" + deeplink + "'>" + deeplink + "</a>"
                };
                return _this._host.executeOperation("Environment.clipboardSetMultiple", [data]);
            };
            this._host = host;
        }
        StorageAccountActions.prototype.buildQueryItems = function (args) {
            var accountId = args.accountId;
            var resourceType = args.resourceType;
            var resourceName = args.name;
            var subscriptionId = this.extractSubscriptionIdFromAccountId(accountId);
            var queryItems = [
                { key: AzureStorageConstants.deeplinkParameterNames.accountid, value: accountId },
                { key: AzureStorageConstants.deeplinkParameterNames.subscriptionId, value: subscriptionId }
            ];
            if (resourceType && resourceName) {
                queryItems = queryItems.concat([
                    { key: AzureStorageConstants.deeplinkParameterNames.resourceType, value: resourceType },
                    { key: AzureStorageConstants.deeplinkParameterNames.resourceName, value: resourceName }
                ]);
            }
            return queryItems;
        };
        StorageAccountActions.prototype.buildDeeplink = function (queryItems) {
            var deeplink = "storageexplorer://v=1";
            queryItems.forEach(function (item) {
                if (item.key && item.value) {
                    var queryItem = "&" + item.key + "=" + encodeURIComponent(item.value);
                    deeplink += queryItem;
                }
            });
            return deeplink;
        };
        /**
         * A typical account ID:
         * "/subscriptions/{subscription-id}/resourceGroups/{resource-group-name}/providers/Microsoft.ClassicStorage/storageAccounts/{account-name}"
         */
        StorageAccountActions.prototype.extractSubscriptionIdFromAccountId = function (accountId) {
            var subscriptionId;
            if (accountId) {
                var idSegments = accountId.split("/");
                if (idSegments && idSegments.length > 2) {
                    // The 3rd element is subscription id.
                    subscriptionId = idSegments[2];
                }
            }
            return subscriptionId;
        };
        return StorageAccountActions;
    }());
    StorageAccountActions.copyLinkToResource = "Azure.Actions.Storage.copyLinkToResource";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = StorageAccountActions;
});
