/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var DaytonaTabMessengerProxy = (function () {
        function DaytonaTabMessengerProxy() {
            var _this = this;
            if (!DaytonaTabMessengerProxy._daytonaTabMessengerMarshaler) {
                DaytonaTabMessengerProxy._daytonaTabMessengerMarshaler = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("DaytonaTabMessenger", {}, true);
                DaytonaTabMessengerProxy._daytonaTabMessengerMarshaler.addEventListener("TabEvent", function (event) {
                    _this._onTabEvent(event);
                });
                DaytonaTabMessengerProxy._daytonaTabMessengerMarshaler._call("initialized");
            }
            this._eventsHandlers = {};
        }
        DaytonaTabMessengerProxy.prototype._onTabEvent = function (event) {
            var eventHandlers = this._eventsHandlers[event.eventName];
            if (!!eventHandlers) {
                for (var i = 0; i < eventHandlers.length; i++) {
                    var eventHandler = eventHandlers[i];
                    eventHandler(event.args);
                }
            }
        };
        DaytonaTabMessengerProxy.prototype.on = function (event, eventHandler) {
            if (!this._eventsHandlers[event]) {
                this._eventsHandlers[event] = [];
            }
            this._eventsHandlers[event].push(eventHandler);
        };
        return DaytonaTabMessengerProxy;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new DaytonaTabMessengerProxy();
});
