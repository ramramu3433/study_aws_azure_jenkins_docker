/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var NodeAttributeSubscription = (function () {
        function NodeAttributeSubscription(callback, unsubscribeCallback) {
            var _this = this;
            this.unsubscribe = function () {
                _this._unsubscribeCallback(_this);
            };
            this.dispose = function () {
                delete _this.notify;
                delete _this.unsubscribe;
            };
            this.id = NodeAttributeSubscription._nextId++;
            this.notify = callback;
            this._unsubscribeCallback = unsubscribeCallback;
        }
        return NodeAttributeSubscription;
    }());
    NodeAttributeSubscription._nextId = 0;
    return NodeAttributeSubscription;
});
