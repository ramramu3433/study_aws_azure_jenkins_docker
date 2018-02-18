/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "es6-promise"], function (require, exports, es6_promise_1) {
    "use strict";
    var NodeEnumerator = (function () {
        function NodeEnumerator(accessor, hasNext) {
            var _this = this;
            this._currentIndex = 0;
            this.forNext = function (callback, count) {
                return _this._accessor(_this._currentIndex, count).then(function (nodes) {
                    if (nodes) {
                        _this._currentIndex += nodes.length;
                        // although we are emulating forEach, we use map to get all of the potential promises that are
                        // returned by the callbacks
                        return es6_promise_1.Promise.all(nodes.map(callback));
                    }
                });
            };
            this.mapNext = function (callback, count) {
                return _this._accessor(_this._currentIndex, count).then(function (nodes) {
                    if (nodes) {
                        _this._currentIndex += nodes.length;
                        return nodes.map(callback);
                    }
                });
            };
            this.hasNext = function () {
                return _this._hasNext(_this._currentIndex);
            };
            this._accessor = accessor;
            this._hasNext = hasNext;
        }
        return NodeEnumerator;
    }());
    return NodeEnumerator;
});
