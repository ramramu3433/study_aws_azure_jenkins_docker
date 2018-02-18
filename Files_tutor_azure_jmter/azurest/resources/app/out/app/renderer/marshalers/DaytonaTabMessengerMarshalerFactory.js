"use strict";
/*!---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *----------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
var StandardMarshaler_1 = require("./StandardMarshaler");
var daytona_1 = require("daytona");
var q = require("q");
var daytonaTabMarshalers = [];
var DaytonaTabMessengerMarshaler = (function () {
    function DaytonaTabMessengerMarshaler() {
        var _this = this;
        this._initializedDeferred = q.defer();
        this.sendEvent = function (event, args) {
            _this._initializedDeferred.promise.then(function () {
                try {
                    _this.portMarshalerInstance.fireEvent("TabEvent", {
                        eventName: event, args: args
                    });
                }
                catch (error) {
                    console.error(error);
                }
            });
        };
        this.initialized = function () {
            _this._initializedDeferred.resolve();
        };
        this._ops = {
            sendEvent: this.sendEvent,
            initialized: this.initialized
        };
        this.portMarshalerInstance = new daytona_1.JsonPortMarshaler(StandardMarshaler_1.default.getStandardMarshaler(this._ops));
    }
    return DaytonaTabMessengerMarshaler;
}());
var DaytonaTabMessengerMarshalerFactory = (function () {
    function DaytonaTabMessengerMarshalerFactory() {
    }
    DaytonaTabMessengerMarshalerFactory.broadCastEvent = function (event, args) {
        for (var i = 0; i < daytonaTabMarshalers.length; i++) {
            daytonaTabMarshalers[i].sendEvent(event, args);
        }
    };
    DaytonaTabMessengerMarshalerFactory.createMarshaler = function () {
        daytonaTabMarshalers.push(new DaytonaTabMessengerMarshaler());
        return daytonaTabMarshalers[daytonaTabMarshalers.length - 1].portMarshalerInstance;
    };
    return DaytonaTabMessengerMarshalerFactory;
}());
exports.default = DaytonaTabMessengerMarshalerFactory;
