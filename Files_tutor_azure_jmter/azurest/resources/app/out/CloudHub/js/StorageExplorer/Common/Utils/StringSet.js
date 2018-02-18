/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "underscore"], function (require, exports, _) {
    "use strict";
    /**
     * A string set implementation.
     * CONSIDER: ES6 already supports Set now, which we will switch to when we move from ES5 to ES6.
     */
    var StringSet = (function () {
        function StringSet(strs) {
            var _this = this;
            this._setObj = {};
            this._val = {}; // val eliminates the need for a hasOwnProperty() check.
            strs = strs || [];
            strs.forEach(function (value) { return _this.add(value); });
        }
        StringSet.prototype.add = function (str) {
            this._setObj[str] = this._val;
        };
        StringSet.prototype.has = function (str) {
            return this._setObj[str] === this._val;
        };
        StringSet.prototype.remove = function (str) {
            delete this._setObj[str];
        };
        StringSet.prototype.values = function () {
            return _.keys(this._setObj);
        };
        return StringSet;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = StringSet;
});
