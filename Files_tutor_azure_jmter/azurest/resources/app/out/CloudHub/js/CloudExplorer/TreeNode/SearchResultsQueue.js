/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "knockout"], function (require, exports, ko) {
    "use strict";
    /*
     * Queue of Nodes that are results of a search. Class was created
     * because we wanted isEmpty and the array to be tightly coupled.
     */
    var SearchResultsQueue = (function () {
        function SearchResultsQueue() {
            var _this = this;
            this.clear = function () {
                _this._searchResultQueue([]);
            };
            this.isEmpty = ko.pureComputed(function () {
                return _this._searchResultQueue().length === 0;
            });
            this.push = function () {
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i] = arguments[_i];
                }
                (_a = _this._searchResultQueue).push.apply(_a, items);
                return _this._searchResultQueue.length;
                var _a;
            };
            this.splice = function (start, deleteCount) {
                var items = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    items[_i - 2] = arguments[_i];
                }
                var splicedElements = (_a = _this._searchResultQueue).splice.apply(_a, [start, deleteCount].concat(items));
                return splicedElements;
                var _a;
            };
            this._searchResultQueue = ko.observableArray([]);
        }
        Object.defineProperty(SearchResultsQueue.prototype, "length", {
            get: function () {
                return this._searchResultQueue().length;
            },
            enumerable: true,
            configurable: true
        });
        return SearchResultsQueue;
    }());
    return SearchResultsQueue;
});
