/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../../../Scripts/global.d.ts" />
    /**
     * Represents a collection of uids combined into one.
     */
    var NodeUid = (function () {
        function NodeUid(currentUid, parentUid) {
            if (parentUid === void 0) { parentUid = null; }
            if (!!parentUid) {
                this._uidComponents = parentUid._uidComponents.slice();
                this._uidComponents.push(currentUid);
            }
            else {
                this._uidComponents = [currentUid];
            }
        }
        NodeUid.prototype.toString = function () {
            return this._uidComponents.join(NodeUid.delimiter);
        };
        /**
         * Compares the NodeUid to an array of uids
         */
        NodeUid.prototype.equals = function (uidArray) {
            var _this = this;
            if (this._uidComponents.length !== uidArray.length) {
                return false;
            }
            this._uidComponents.forEach(function (value, index) {
                if (_this._uidComponents[index] !== uidArray[index]) {
                    return false;
                }
            });
            return true;
        };
        NodeUid.prototype.toArray = function () {
            return this._uidComponents.slice();
        };
        /**
         * Compares two NodeUids to each other
         */
        NodeUid.equals = function (a, b) {
            return a.equals(b._uidComponents);
        };
        return NodeUid;
    }());
    NodeUid.delimiter = "|-|";
    return NodeUid;
});
