/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports", "ActivityLog/StorageExplorer/ActionCanceledError"], function (require, exports, ActionCanceledError_1) {
    "use strict";
    /**
     * Provides an object that can create cancel tokens and provides the ability to cancel it
     */
    var CancelSource = (function () {
        function CancelSource() {
            this._token = new CancelToken(this);
            this._isCanceled = false;
        }
        CancelSource.prototype.cancel = function () {
            this._isCanceled = true;
        };
        Object.defineProperty(CancelSource.prototype, "isCanceled", {
            get: function () { return this._isCanceled; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CancelSource.prototype, "token", {
            get: function () { return this._token; },
            enumerable: true,
            configurable: true
        });
        return CancelSource;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CancelSource;
    var CancelToken = (function () {
        function CancelToken(cancelSource) {
            this._source = cancelSource;
        }
        Object.defineProperty(CancelToken.prototype, "isCanceled", {
            get: function () { return this._source.isCanceled; },
            enumerable: true,
            configurable: true
        });
        CancelToken.prototype.throwIfCanceled = function () {
            if (this.isCanceled) {
                throw new ActionCanceledError_1.ActionCanceledError();
            }
        };
        return CancelToken;
    }());
});
