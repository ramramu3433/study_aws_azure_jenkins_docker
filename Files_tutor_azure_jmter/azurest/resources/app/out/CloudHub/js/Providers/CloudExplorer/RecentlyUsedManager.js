/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "Common/Debug", "es6-promise"], function (require, exports, Debug, es6_promise_1) {
    "use strict";
    var RecentlyUsedManager = (function () {
        function RecentlyUsedManager() {
            this.maxItemCount = 5;
        }
        /**
         * Adds an item to "Recently Used".
         */
        RecentlyUsedManager.prototype.addToRecentlyUsed = function (newItem) {
            var _this = this;
            Debug.assert(!!newItem);
            var items = RecentlyUsedManager.recentlyUsedItems;
            if (!items.some(function (v) { return _this.isSameResource(v, newItem); })) {
                items.push(newItem);
                // If there are more items than allowed, remove the oldest items.
                while (items.length > this.maxItemCount) {
                    items.splice(0, 1);
                }
            }
            RecentlyUsedManager.recentlyUsedItems = items;
            return es6_promise_1.Promise.resolve(null);
        };
        RecentlyUsedManager.prototype.getRecentlyUsedItems = function () {
            return es6_promise_1.Promise.resolve(RecentlyUsedManager.recentlyUsedItems);
        };
        RecentlyUsedManager.prototype.numOfRecentlyUsedItems = function () {
            return es6_promise_1.Promise.resolve(RecentlyUsedManager.recentlyUsedItems.length);
        };
        RecentlyUsedManager.prototype.isSameResource = function (itemX, itemY) {
            if (!itemX || !itemY) {
                return itemX === itemY;
            }
            if (itemX.producerNamespace !== itemY.producerNamespace) {
                return false;
            }
            if (!itemX.producerArgs || !itemY.producerArgs) {
                return itemX.producerArgs === itemY.producerArgs;
            }
            var xKeys = Object.keys(itemX.producerArgs);
            var yKeys = Object.keys(itemY.producerArgs);
            if (xKeys.length !== yKeys.length) {
                return false;
            }
            return xKeys.every(function (value, index, array) {
                return yKeys.indexOf(value) !== -1 && itemX.producerArgs[value] === itemY.producerArgs[value];
            });
        };
        return RecentlyUsedManager;
    }());
    RecentlyUsedManager.recentlyUsedItems = [];
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RecentlyUsedManager;
});
